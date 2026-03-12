import { Score } from "../../types/ScoreCuts";
import { ohSansiApi } from "../ohSansiApi";

export const scoreCutsService = {
  getScoreCuts: async (
    olympiadId: number,
    areaId: number,
    phaseId?: number,
    levelId?: number
  ) => {
    const url = `/olympiads/${olympiadId}/areas/${areaId}/score-cuts`;
    const params: any = {};

    if (phaseId) params.phase_id = phaseId;
    if (levelId) params.level_id = levelId;

    const response = await ohSansiApi.get(url, { params });
    const result = response.data;

    const items = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : [];

    return items;
  },

  getMaxScores: async (
    olympiadId: number,
    areaId: number,
    phaseId?: number,
    levelId?: number
  ) => {
    const url = `/olympiads/${olympiadId}/areas/${areaId}/max-scores`;
    const params: any = {};

    if (phaseId) params.phase_id = phaseId;
    if (levelId) params.level_id = levelId;

    const response = await ohSansiApi.get(url, { params });
    const result = response.data;

    const items = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : [];

    return items;
  },

  updateScoreCut: async (olympiadId: number, areaId: number, data: any) => {
    const response = await ohSansiApi.post(
      `/olympiads/${olympiadId}/areas/${areaId}/score-cuts`,
      data
    );
    return response.data;
  },

  updateMaxScore: async (olympiadId: number, areaId: number, data: any) => {
    const response = await ohSansiApi.post(
      `/olympiads/${olympiadId}/areas/${areaId}/max-scores`,
      data
    );
    return response.data;
  },

  checkQualified: async (olympiadId: number, phaseId: number, areaId: number, levelId: number) => {
    try {
      const url = `/olympiads/${olympiadId}/phases/${phaseId}/areas/${areaId}/levels/${levelId}/competitors`;
      const response = await ohSansiApi.get(url);
      return response.data;
    } catch (error) {
      console.error("Error verificando competidores calificados:", error);
      throw error;
    }
  },
};

export const getScoresByOlympiadAreaPhaseLevel = async (OlympiadId: number, areaId: number, phaseId: number, levelId: number): Promise<Score> => {
  const res = await ohSansiApi.get(
    `/olympiads/${OlympiadId}/areas/${areaId}/phases/${phaseId}/level/${levelId}/scores`
  );
  return res.data;
}