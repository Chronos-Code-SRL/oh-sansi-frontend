export interface Olympiad {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    numberOfPhases: number;
    createdAt: string;
    updatedAt: string;
}

export interface AllOlympiads {
    olympiads: Olympiad[];
    status?: number;
};

export interface OlympiadPayload {
    name: string;
    start_date: string;
    end_date: string;
    number_of_phases: number;
    areas: string[];
}
