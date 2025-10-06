import { ohSansiApi } from "./ohSansiApi";

export const levelGradesService = {
  getLevelsFromArea: (olympiadId: number, areaId: number) =>
    ohSansiApi.get(`/olympiads/${olympiadId}/areas/${areaId}/level-grades`),

  addLevelToArea: (olympiadId: number, areaId: number, data: any) =>
    ohSansiApi.post(`/olympiads/${olympiadId}/areas/${areaId}/level-grades`, data),

  removeLevelFromArea: (olympiadId: number, areaId: number, data: any) =>
    ohSansiApi.delete(`$/olympiads/${olympiadId}/areas/${areaId}/level-grades`, { data }),

};
