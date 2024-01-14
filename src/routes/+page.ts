import {
	DateParameterFormat,
	DateParameterName,
	ScheduleParameterWeekNumber
} from '$helpers/constants';
import type { MyFitnessEvent } from '$models';
import { getISOWeek, parse } from 'date-fns';

export const load = async ({ fetch, url }) => {
	const dateParameter = url.searchParams.get(DateParameterName);
	const date = dateParameter ? parse(dateParameter, DateParameterFormat, new Date()) : new Date();
	const weekNumber = getWeekNumber(date);

	// Use CORS Proxy to circumvent CORS
	const schedulePromise = fetch(`/api/schedule?${ScheduleParameterWeekNumber}=${weekNumber}`, {
		method: 'GET'
	});

	return {
		date,
		url,
		streamed: {
			schedule: schedulePromise.then(async (r) => {
				const content = await r.json();
				return content as MyFitnessEvent[];
			})
		}
	};
};

function getWeekNumber(date: Date): number {
	const now = new Date();
	const weekNumber = getISOWeek(date);
	const currentWeekNumber = getISOWeek(new Date());

	// Adjust week number if it starts in new year
	return date > now && weekNumber < currentWeekNumber ? 52 + weekNumber : weekNumber;
}
