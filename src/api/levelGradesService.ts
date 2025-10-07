import { ohSansiApi } from "./ohSansiApi";

export const levelGradesService = {
  getLevelsFromArea: async (olympiadId: number, areaId: number) => {
    const response = await ohSansiApi.get(
      `/olympiads/${olympiadId}/areas/${areaId}/level-grades`
    );
    return response.data;
  },

  addLevelToArea: async (olympiadId: number, areaId: number, data: any) => {
    const response = await ohSansiApi.post(
      `/olympiads/${olympiadId}/areas/${areaId}/level-grades`,
      data
    );
    return response.data;
  },

  removeLevelFromArea: async (olympiadId: number, areaId: number, data: any) => {
    const response = await ohSansiApi.delete(
      `/olympiads/${olympiadId}/areas/${areaId}/level-grades`,
      { data }
    );
    return response.data;
  },
};
