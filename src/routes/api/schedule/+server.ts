import { MyFitnessUrl, ScheduleParameterWeekNumber } from '$helpers/constants';
import type { MyFitnessEvent } from '$models';
import { error } from '@sveltejs/kit';
import { addHours, addMinutes, parse } from 'date-fns';
import { HTMLElement, parse as parseHtml } from 'node-html-parser';

const timeRegex: RegExp = /\b(\d{2}:\d{2})\b/;
const registeredPlacesRegex: RegExp = /\b(\d+)\b/;
const totalPlacesRegex = registeredPlacesRegex;

export async function GET({ url, fetch }) {
	const weekNumber = Number(url.searchParams.get(ScheduleParameterWeekNumber));
	if (isNaN(weekNumber)) {
		error(400, 'weekNumber must be a number');
	}

	const formData = new FormData();
	formData.append('action', 'oi_get_timetable_new');
	formData.append('week_number', weekNumber.toString());
	formData.append('week', weekNumber.toString());
	formData.append('xhr', 'true');

	const response = await fetch(`${MyFitnessUrl}/wp-admin/admin-ajax.php`, {
		method: 'POST',
		body: formData
	});

	if (response.status !== 200) {
		error(400, 'Failed to fetch schedule');
	}

	const body = await response.text();
	const parseResult = parseSchedule(body);

	return Response.json(parseResult);
}

function parseSchedule(body: string): MyFitnessEvent[] {
	const root = parseHtml(body);
	const table = root.querySelector('table.timetable-table');
	const dates = table !== null ? getTableDates(table) : [];

	if (dates.length === 0) {
		return [];
	}

	const tableBody = table?.querySelector('tbody');
	const tableBodyRows = tableBody?.querySelectorAll('tr');

	if (!tableBodyRows) {
		return [];
	}

	return tableBodyRows
		.flatMap((tr) =>
			tr.querySelectorAll('td.day').flatMap((td, i) =>
				td
					.querySelectorAll('div.training-class-item')
					.reduce((acc: MyFitnessEvent[], training: HTMLElement) => {
						const event = parseEvent(training, dates[i]);
						return event ? [...acc, event] : acc;
					}, [])
			)
		)
		.sort(
			(a, b) =>
				a.date.getTime() - b.date.getTime() ||
				a.club.localeCompare(b.club) ||
				a.training.localeCompare(b.training) ||
				a.coach.localeCompare(b.coach) ||
				// To make deterministic
				a.id - b.id
		);
}

function getTableDates(table: HTMLElement) {
	const header = table.querySelector('thead');
	const days = header?.querySelectorAll('th span.date');

	return days ? days.map((x) => parse(x.innerHTML, 'dd.MM.yyyy', new Date())) : [];
}

function parseEvent(element: HTMLElement, date: Date): MyFitnessEvent | undefined {
	const tooltip = element.querySelector('div.bron-tooltip');
	const url = tooltip?.querySelector('a');

	if (!url) {
		return undefined;
	}

	const classId = url.getAttribute('data-class-id');
	if (!classId) {
		return undefined;
	}

	const id = Number(classId);
	if (isNaN(id)) {
		return undefined;
	}

	const training = element.getAttribute('data-name');
	if (!training) {
		return undefined;
	}

	const coach = element.getAttribute('data-trainer-name');
	if (!coach) {
		return undefined;
	}

	const club = element.getAttribute('data-club-name');
	if (!club) {
		return undefined;
	}

	const titleElement = element.querySelector('span.title');
	if (!titleElement) {
		return undefined;
	}

	const dateTime = getDateTime(date, titleElement);
	if (!dateTime) {
		return undefined;
	}

	const registeredPlacesElement = tooltip?.querySelector('span.registered');
	const registeredPlaces = registeredPlacesElement
		? getRegisteredPlaces(registeredPlacesElement)
		: null;

	const totalPlacesElement = tooltip?.querySelector('span.places');
	const totalPlaces = totalPlacesElement ? getTotalPlaces(totalPlacesElement) : null;

	return {
		id,
		club,
		coach,
		training,
		date: dateTime,
		registeredPlaces,
		totalPlaces
	};
}

function getDateTime(date: Date, element: HTMLElement): Date | null {
	const result = element.innerHTML.match(timeRegex);
	if (result) {
		const value = result[1];
		const parts = value.split(':');

		if (parts.length != 2) {
			return null;
		}

		return addMinutes(addHours(date, Number(parts[0])), Number(parts[1]));
	}

	return null;
}

function getRegisteredPlaces(element: HTMLElement): number | null {
	const result = element.innerHTML.match(registeredPlacesRegex);
	if (result) {
		const value = Number(result[1]);
		if (!isNaN(value)) {
			return value;
		}
	}

	return null;
}

function getTotalPlaces(element: HTMLElement): number | null {
	const result = element.innerHTML.match(totalPlacesRegex);
	if (result) {
		const value = Number(result[1]);
		if (!isNaN(value)) {
			return value;
		}
	}

	return null;
}
