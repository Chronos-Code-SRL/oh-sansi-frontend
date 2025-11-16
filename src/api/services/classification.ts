import { ohSansiApi } from "../ohSansiApi";

export const updateClassification = async (
    evaluationId: number,
    payload: {
        classification_status: string;
        classification_place: string | null;
        description: string | null;
    }
) => {
    const res = await ohSansiApi.patch(`/evaluations/${evaluationId}/classification`, payload);
    return res.data;
};
