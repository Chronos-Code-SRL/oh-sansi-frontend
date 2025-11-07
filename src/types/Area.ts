export interface Area {
    id: number;
    name: string;
}

export interface AreasResponse {
    areas: Area[];
    status: number;
}