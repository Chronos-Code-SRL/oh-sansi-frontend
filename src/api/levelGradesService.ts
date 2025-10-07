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

  removeLevelFromArea: async (olympiadId: number, areaId: number, levelId: number) => {
    const response = await ohSansiApi.delete(
      `/olympiads/${olympiadId}/areas/${areaId}/level-grades`,
      {
        headers: { "Content-Type": "application/json" },
        data: { level_id: levelId } as any, // El cuerpo debe ir dentro de "data"
      } as any
    );
    return response.data;
  },
};
