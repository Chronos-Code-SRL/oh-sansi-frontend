import { ohSansiApi } from "../ohSansiApi";
import { ScoreCutResponse, ScoreCutUpdateRequest, ScoreCutUpdateResponse } from "../../types/ScoreCuts";


export const ScoreCutsApi = {

  getScoreCuts: async (olympiadId: number, areaId: number): Promise<ScoreCutResponse> => {
    try {
      const response = await ohSansiApi.get(
        `/olympiads/${olympiadId}/areas/${areaId}/score-cuts`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error al obtener los umbrales:", error);
      throw error.response?.data || error;
    }
  },

  updateScoreCuts: async (
    olympiadId: number,
    areaId: number,
    data: ScoreCutUpdateRequest
  ): Promise<ScoreCutUpdateResponse> => {
    try {
      const fixedData = {
      ...data,
      score_cut: Number(data.score_cut), 
    };
      const response = await ohSansiApi.post(
        `/olympiads/${olympiadId}/areas/${areaId}/score-cuts`,
        fixedData,
        {
          headers: {
            "Content-Type": "application/json", 
          },
        }
      );
      return response.data; 
    } catch (error: any) {
      console.error("Error al actualizar el umbral:", error);
      throw error.response?.data || error;
    }
  },
};
