import { ohSansiApi } from "../ohSansiApi";
import { Contestant, EvaluationUpdatePayload, FilterList } from "../../types/Contestant";

const CONTESTANTS_URL = `/contestants`;

export const getContestantByPhaseOlympiadArea = async (
    idPhase: number,
    idOlympiad: number,
    idArea: number
): Promise<Contestant[]> => {
    const res = await ohSansiApi.get<Contestant[]>(
        `${CONTESTANTS_URL}/${idPhase}/${idOlympiad}/${idArea}`
    );
    return res.data;
}

export const getContestantByFilters = async (): Promise<FilterList[]> => {
    const res = await ohSansiApi.get<FilterList[]>(`${CONTESTANTS_URL}`);
    return res.data;
}

// type ApiResponse<T> = {
//     message: string;
//     data: T;
//     status: number;
// };

// export const getContestantByPhaseOlympiadArea = async (
//     IdPhase: number,
//     idOlympiad: number,
//     idArea: number
// ): Promise<Contestant[]> => {
//     const res = await ohSansiApi.get<ApiResponse<Contestant[]>>(
//         `${CONTESTANTS_URL}/${IdPhase}/${idOlympiad}/${idArea}`
//     );
//     return res.data.data; // devolver solo el arreglo
// };


export async function updatePartialEvaluation(
    id: number | string,
    payload: EvaluationUpdatePayload,
) {
    const { data } = await ohSansiApi.patch(`/evaluations/${id}`, payload);
    return data as { message: string; status: number };
}

export type EvaluationDelta = {
    id_evaluation: number;
    registration_id: number;
    contestant_id: number;
    score: number | null;
    description: string | null;
    status: boolean;
    created_at: string;
    updated_at: string;
};

export async function checkUpdates(lastUpdateAt?: string | null) {
    const res = await ohSansiApi.get("/evaluations/check-updates", {
        params: { lastUpdateAt: lastUpdateAt ?? undefined, _: Date.now() },
        headers: { "Cache-Control": "no-cache" },
    });
    return res.data as {
        new_evaluations: EvaluationDelta[];
        last_updated_at: string;
        status: number;
    };
}