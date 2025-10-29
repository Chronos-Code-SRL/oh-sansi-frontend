import { ohSansiApi } from "../ohSansiApi";

export const scoreCutsService = {
  getScoreCuts: async (olympiadId: number, areaId: number) => {
    const response = await ohSansiApi.get(
      `/olympiads/${olympiadId}/areas/${areaId}/score-cuts`
    );
    return response.data.data; 
  },

  updateScoreCut: async (
    olympiadId: number,
    areaId: number,
    data:
      | { phase_id: number; level_id: number; score_cut: number } 
      | { phase_id: number; score_cut: number }                   
  ) => {
    const response = await ohSansiApi.post(
      `/olympiads/${olympiadId}/areas/${areaId}/score-cuts`,
      data
    );
    return response.data;
  },

};
