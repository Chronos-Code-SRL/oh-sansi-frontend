import { ohSansiApi } from "../ohSansiApi";
import { AwardWinningCompetitors, AwardWinningCompetitorsResponse, ConstestantRanked, Contestant, ContestantMedal, ContestantMedalList, ContestantStats, Evaluation, EvaluationUpdatePayload, FilterList } from "../../types/Contestant";

const CONTESTANTS_URL = `/contestants`;

export const getContestantByPhaseOlympiadAreaLevel = async (idPhase: number, idOlympiad: number, idArea: number, levelId: number): Promise<Contestant[]> => {
    const res = await ohSansiApi.get<Contestant[]>(
        `${CONTESTANTS_URL}/${idPhase}/${idOlympiad}/${idArea}/${levelId}`
    );
    return res.data;
}

export const getContestantByFilters = async (
    olympiadId: number
): Promise<FilterList[]> => {

    const res = await ohSansiApi.get<FilterList[]>(
        `${CONTESTANTS_URL}/${olympiadId}`
    );

    return res.data;
};


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

export const getAwardWinningCompetitors = async (
    olympiadId: number,
    areaId: number,
): Promise<AwardWinningCompetitors[]> => {

    const res = await ohSansiApi.get<AwardWinningCompetitorsResponse>(
        `${CONTESTANTS_URL}/awarded/olympiads/${olympiadId}/areas/${areaId}`
    );

    return res.data.contestants; // ✔️ ahora sí devuelves un array
};

//For medals
export const getContestantMedals = async (
    olympiadId: number,
    areaId: number,
    levelId: number,
): Promise<ContestantMedal[]> => {
    const res = await ohSansiApi.get<ContestantMedal[]>(
        `/contestants/olympiads/${olympiadId}/areas/${areaId}/levels/${levelId}`
    );

    return res.data;
};

export async function updateMedal(
    id: number,
    payload: EvaluationUpdatePayload,
) {
    const { data } = await ohSansiApi.patch(`/evaluations/${id}/classification`, payload);
    return data as { message: string; status: number };
}

// Interface para los datos del medallero
export interface MedalCounts {
    gold: number;
    silver: number;
    bronze: number;
    honorable_mention: number;
}

// Interface para los parámetros de la petición
export interface GenerateMedalParams {
    olympiadId: number;
    areaId: number;
    levelId: number;
    medalCounts: {
        gold: number;
        silver: number;
        bronze: number;
        honorable_mention: number;
    };
}

export const getContestantStats = async (olympiadId: number, areaId: number, levelId: number, medalCounts: MedalCounts
): Promise<ContestantMedal[]> => {
    const res = await ohSansiApi.get<ContestantMedal[]>(
        `/contestants/awarded/olympiads/${olympiadId}/areas/${areaId}/levels/${levelId}`
    );
    return res.data;
};