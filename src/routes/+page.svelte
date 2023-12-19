<script lang="ts">
	import { addMonths, format, startOfWeek } from 'date-fns';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import {
		ClubParameterName,
		DateParameterFormat,
		DateParameterName,
		MyFitnessClubs,
		MyFitnessTrainings,
		MyFitnessUrl,
		TrainingParameterName
	} from '$helpers/constants';
	import { goto } from '$app/navigation';
	import Spinner from '$components/spinner.svelte';

	export let data: PageData;

	let selectedClub: string | null = data.url.searchParams.get(ClubParameterName);
	let selectedTraining: string | null = data.url.searchParams.get(TrainingParameterName);

	async function onDateChange(
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	): Promise<void> {
		if (event.currentTarget.valueAsDate) {
			const url = new URL($page.url);
			url.searchParams.set(
				DateParameterName,
				format(event.currentTarget.valueAsDate, DateParameterFormat)
			);
			await goto(url, { replaceState: true, keepFocus: true });
		}
	}

	async function onClubChange(
		event: Event & { currentTarget: EventTarget & HTMLSelectElement }
	): Promise<void> {
		const item = event.currentTarget.selectedOptions.item(0);

		if (item) {
			const url = new URL($page.url);
			url.searchParams.set(ClubParameterName, item.value);
			await goto(url, { replaceState: true, keepFocus: true });
		}
	}

	async function onTrainingChange(
		event: Event & { currentTarget: EventTarget & HTMLSelectElement }
	): Promise<void> {
		const item = event.currentTarget.selectedOptions.item(0);

		if (item) {
			const url = new URL($page.url);
			url.searchParams.set(TrainingParameterName, item.value);
			await goto(url, { replaceState: true, keepFocus: true });
		}
	}

	function openEvent(id: number) {
		open(`${MyFitnessUrl}/nodarbibu-saraksts/grupu-nodarbibas/?class_id=${id}`);
	}
</script>

<div class="h-full rounded-lg p-4 dark:bg-neutral-700">
	<div class="flex h-full flex-col gap-4">
		<div class="grid grid-cols-1 gap-2 md:grid-cols-3">
			<div class="flex flex-col gap-1">
				<label for="date-input">Date</label>
				<input
					id="date-input"
					type="date"
					min={format(startOfWeek(new Date()), 'yyyy-MM-dd')}
					max={format(addMonths(startOfWeek(new Date()), 1), 'yyyy-MM-dd')}
					value={format(data.date, 'yyyy-MM-dd')}
					on:change={onDateChange}
					class="w-full dark:[color-scheme:dark]"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for="club-input">Club</label>
				<select id="club-input" bind:value={selectedClub} on:change={onClubChange} class="w-full">
					<option value={null}></option>
					{#each MyFitnessClubs as club}
						<option value={club}>{club}</option>
					{/each}
				</select>
			</div>

			<div class="flex flex-col gap-1">
				<label for="training-input">Training</label>
				<select
					id="training-input"
					bind:value={selectedTraining}
					on:change={onTrainingChange}
					class="w-full"
				>
					<option value={null}></option>
					{#each MyFitnessTrainings as training}
						<option value={training}>{training}</option>
					{/each}
				</select>
			</div>
		</div>

		{#await data.streamed.schedule}
			<div class="flex h-full w-full items-center justify-center">
				<Spinner />
			</div>
		{:then schedule}
			<div class="overflow-auto">
				<table class="h-full w-full">
					<thead class="sticky top-0 z-10 hidden dark:bg-black sm:table-header-group">
						<tr>
							<th>Date</th>
							<th>Day</th>
							<th>Club</th>
							<th>Training</th>
							<th>Coach</th>
							<th>Places</th>
						</tr>
					</thead>

					<tbody>
						<!-- Backend api does not allow filtering by training. Therefore we filter it here -->
						{#each schedule.filter((x) => (!selectedTraining || x.training === selectedTraining) && (!selectedClub || x.club === selectedClub)) as event (event.id)}
							<tr
								class="mb-4 flex cursor-pointer flex-col whitespace-nowrap hover:dark:bg-neutral-500 sm:table-row"
								on:click={() => openEvent(event.id)}
							>
								<td>{format(event.date, 'dd.MM.yyyy HH:mm')}</td>
								<td>{format(event.date, 'EEEE')}</td>
								<td>{event.club}</td>
								<td>{event.training}</td>
								<td>{event.coach}</td>
								<td
									class="border-b border-red-500 last:sm:border-b-0"
									class:text-red-500={(event.registeredPlaces ?? 0) > (event.totalPlaces ?? 0)}
									>{event.registeredPlaces !== null && event.totalPlaces !== null
										? `${event.registeredPlaces}/${event.totalPlaces}`
										: ''}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:catch error}
			<p style="color: red">{error.message}</p>
		{/await}
	</div>
</div>

<style lang="postcss">
	td {
		@apply px-2;
	}

	th {
		@apply px-2 text-left;
	}
</style>
