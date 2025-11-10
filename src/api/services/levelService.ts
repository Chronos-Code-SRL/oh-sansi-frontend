import { ohSansiApi } from "../ohSansiApi";
import { LevelResponse } from "../../types/Level";

export const levelService = {
  getLevelsByArea: async (olympiadId: number, areaId: number): Promise<LevelResponse> => {
    const response = await ohSansiApi.get(`/olympiads/${olympiadId}/area/${areaId}`);
    return response.data;
  },
};
