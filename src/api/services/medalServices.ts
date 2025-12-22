import { CreateMedalsPayload, Medals } from "../../types/Medal";
import { ohSansiApi } from "../ohSansiApi";

export const getMedalsArea = async (olympiadId: number, areaId: number,
): Promise<Medals> => {
    const res = await ohSansiApi.get<Medals>(
        `/medals/olympiads/${olympiadId}/areas/${areaId}`
    );

    return res.data;
};

export const createMedals = async (
    olympiadId: number,
    areaId: number,
    data: CreateMedalsPayload
): Promise<CreateMedalsPayload> => {
    const res = await ohSansiApi.post<CreateMedalsPayload>(
        `/medals/olympiads/${olympiadId}/areas/${areaId}`,
        data
    );

    return res.data;
};