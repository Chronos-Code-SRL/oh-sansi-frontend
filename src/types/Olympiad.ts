export interface Olympiad {
    id: number;
    name: string;
    edition:string;
    startDate: string;
    endDate: string;
    numberOfPhases: number;
    createdAt: string;
    updatedAt:string;
}

export interface AllOlympiads  {
    olympiads: Olympiad[];
    status?: number; 
};


