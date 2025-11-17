import { Phase } from "../../types/Phase";
import { ohSansiApi } from "../ohSansiApi";

export const getOlympiadPhases = async (olympiadId: number): Promise<Phase[]> => {
  const res = await ohSansiApi.get(`/olympiads/${olympiadId}/phases`);
  return res.data.phases; // según tu ejemplo del backend
};

export async function getPhaseStatuses(olympiadId: number, areaId: number) {
    return ohSansiApi.get(`/olympiads/${olympiadId}/areas/${areaId}/phase-status`);
}

export const updatePhaseStatus = async (olympiadId: number, areaId: number, phaseId: number) => {
    return ohSansiApi.put(`/olympiads/${olympiadId}/areas/${areaId}/phase-status`, {
        phase_id: phaseId,
        status: "Terminada"
    });
}