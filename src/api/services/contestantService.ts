import { ohSansiApi } from "../ohSansiApi";
import { Contestant, ContestantStats, Evaluation, EvaluationUpdatePayload, FilterList } from "../../types/Contestant";

const CONTESTANTS_URL = `/contestants`;

export const getContestantByPhaseOlympiadAreaLevel = async (idPhase: number, idOlympiad: number, idArea: number, levelId: number): Promise<Contestant[]> => {
    const res = await ohSansiApi.get<Contestant[]>(
        `${CONTESTANTS_URL}/${idPhase}/${idOlympiad}/${idArea}/${levelId}`
    );
    return res.data;
}

export const getContestantByFilters = async (): Promise<FilterList[]> => {
    const res = await ohSansiApi.get<FilterList[]>(`${CONTESTANTS_URL}`);
    return res.data;
}

export async function updatePartialEvaluation(
    id: number | string,
    payload: EvaluationUpdatePayload,
) {
    const { data } = await ohSansiApi.patch(`/evaluations/${id}`, payload);
    return data as { message: string; status: number };
}

export async function checkUpdates(lastUpdateAt?: string | null) {
    const res = await ohSansiApi.get("/evaluations/check-updates", {
        params: { lastUpdateAt: lastUpdateAt ?? undefined, _: Date.now() },
        headers: { "Cache-Control": "no-cache" },
    });
    return res.data as {
        new_evaluations: Evaluation[];
        last_updated_at: string;
        status: number;
    };
}

//Conteo de concursantes por estado de clasificación
export const getContestantStats = async (
    olympiadId: number,
    areaId: number,
    phaseId: number,
    levelId: number
): Promise<ContestantStats> => {
    const res = await ohSansiApi.get<ContestantStats>(
        `/contestants/olympiads/${olympiadId}/areas/${areaId}/phases/${phaseId}/levels/${levelId}`
    );
    return res.data;
};