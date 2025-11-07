export interface Olympiad {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    //numberOfPhases: number;
    //createdAt: string;
    //updatedAt: string;
    status: string;
    areas: string[];
}

export interface AllOlympiads {
    olympiads: Olympiad[];
};

export interface OlympiadPayload {
    name: string;
    start_date: string;
    default_score_cut: number;
    end_date: string;
    number_of_phases: number;
    areas: string[];
}
