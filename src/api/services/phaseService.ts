import { Phase, PhaseResponse} from "../../types/Phase";
import { ohSansiApi } from "../ohSansiApi";

export const getOlympiadPhases = async (olympiadId: number): Promise<Phase[]> => {
  const res = await ohSansiApi.get(`/olympiads/${olympiadId}/phases`);
  return res.data.phases; // según tu ejemplo del backend
};

// Obtener todos los estados de fases para un nivel específico
export async function getPhaseStatuses(olympiadId: number, areaId: number, levelId: number) {
    return ohSansiApi.get(`/olympiads/${olympiadId}/areas/${areaId}/levels/${levelId}/phase-status`);
}

// Obtener el estado de una nivel y fase específica
export const getPhaseStatus = async (olympiadId: number,  areaId: number, levelId: number, phaseId: number
): Promise<PhaseResponse> => {
    const res = await ohSansiApi.get<PhaseResponse>(
        `/olympiads/${olympiadId}/areas/${areaId}/levels/${levelId}/phases/${phaseId}/status`
    );
    return res.data;
};

export const updatePhaseStatus = async (olympiadId: number, areaId: number, levelId: number, phaseId: number) => {
    return ohSansiApi.put(`/olympiads/${olympiadId}/areas/${areaId}/levels/${levelId}/phases/${phaseId}/endorse`, { 
    });
}