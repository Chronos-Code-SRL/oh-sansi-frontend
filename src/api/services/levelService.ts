import { ohSansiApi } from "../ohSansiApi";
import { LevelResponse } from "../../types/Level";

export const levelService = {
  getLevelsByArea: async (olympiadId: number, areaId: number): Promise<LevelResponse> => {
    const response = await ohSansiApi.get(`/olympiads/${olympiadId}/area/${areaId}`);

    const result = response.data?.data ? response.data.data : response.data;

    return result;
  },
};
