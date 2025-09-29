import { ohSansiApi } from "./ohSansiApi";


export interface OlympiadData {
    nombre: string;
    etapas: number;
    fecha_inicio: string;
    fecha_fin: string;
    areas: string[];
}

export const createOlympiad = async (data: OlympiadData) => {
    const response = await ohSansiApi.post("/olympiads", data);
    return response.data;
};