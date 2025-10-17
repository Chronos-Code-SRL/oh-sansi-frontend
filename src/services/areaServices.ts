import { ohSansiApi } from "../api/ohSansiApi";
import { Area, AreasResponse } from "../types/Area";

const AREAS_URL = `/areas`;

export const getAreas = async (): Promise<Area[]> => {
    const res = await ohSansiApi.get<AreasResponse>(AREAS_URL);
    return res.data.areas;
};

export const getAreaByOlympiadId = async (id: number): Promise<Area[]> => {
    const res = await ohSansiApi.get<AreasResponse>(`/olympiads/${id}${AREAS_URL}`);
    return res.data.areas;
}  