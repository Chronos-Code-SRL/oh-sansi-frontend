import { ohSansiApi } from "../ohSansiApi";

export const scoreCutsService = {
  getScoreCuts: async (olympiadId: number, areaId: number) => {
    const response = await ohSansiApi.get(
      `/olympiads/${olympiadId}/areas/${areaId}/score-cuts`
    );
    return response.data;
  },

  getMaxScores: async (olympiadId: number, areaId: number) => {
    const response = await ohSansiApi.get(
      `/olympiads/${olympiadId}/areas/${areaId}/max-scores`
    );
    return response.data;
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
};
