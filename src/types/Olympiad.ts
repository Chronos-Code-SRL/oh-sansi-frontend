export interface Olympiad {
    id: string;
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


//como devuelve el back
// {
//     "olympiads": [
//         {
//             "id": 1,
//             "name": "Olimpiada Científica Estudiantil",
//             "edition": "2025",
//             "start_date": "2025-01-01",
//             "end_date": "2025-12-31",
//             "created_at": "2025-10-03T16:34:06.000000Z",
//             "updated_at": "2025-10-03T16:34:06.000000Z",
//             "number_of_phases": 2
//         }
//     ],
//     "stauts": 200
// }