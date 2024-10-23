export type MyFitnessEvent = {
	id: number;
	date: Date;
	training: string;
	club: string;
	coach: string;
	registeredPlaces: number | null;
	totalPlaces: number | null;
};
