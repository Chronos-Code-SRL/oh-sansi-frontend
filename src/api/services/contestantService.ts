import { ohSansiApi } from "../ohSansiApi";
import { ConstestantRanked, Contestant, Evaluation, EvaluationUpdatePayload, FilterList } from "../../types/Contestant";

const CONTESTANTS_URL = `/contestants`;
const CONTESTANTS_URL1 = `/contestants/1`;

export const getContestantByPhaseOlympiadAreaLevel = async (idPhase: number, idOlympiad: number, idArea: number, levelId: number): Promise<Contestant[]> => {
    const res = await ohSansiApi.get<Contestant[]>(
        `${CONTESTANTS_URL}/${idPhase}/${idOlympiad}/${idArea}/${levelId}`
    );
    return res.data;
}

export const getContestantByFilters = async (): Promise<FilterList[]> => {
    const res = await ohSansiApi.get<FilterList[]>(`${CONTESTANTS_URL1}`);
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

export const getContestantsClassifieds = async (
    olympiadId: number,
    areaId: number,
    phaseId: number,
    levelId: number
): Promise<ConstestantRanked[]> => {
    const res = await ohSansiApi.get<ConstestantRanked[]>(
        `${CONTESTANTS_URL}/olympiads/${olympiadId}/areas/${areaId}/phases/${phaseId}/levels/${levelId}/classifieds`
    );

    return res.data;
};
