import { ohSansiApi } from "../ohSansiApi";
import { Contestant } from "../../types/Contestant";

const CONTESTANTS_URL = `/contestants`;

export const getContestantByPhaseOlympiadArea = async (
    IdPhase: number,
    idOlympiad: number,
    idArea: number
): Promise<Contestant[]> => {
    const res = await ohSansiApi.get<Contestant[]>(
        `${CONTESTANTS_URL}/${IdPhase}/${idOlympiad}/${idArea}`
    );
    return res.data;
}