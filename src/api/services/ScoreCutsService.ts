import { ohSansiApi } from "../ohSansiApi";

export interface ScoreCut {
  id: number;
  score_cut: number;
  level_grade: {
    id: number;
    level_id: number;
    grade_id: number;
  };
}

export interface ScoreCutPhase {
  id: number;
  phase: {
    id: number;
    name: string;
  };
  olympiad_area_phase_level_grades: ScoreCut[];
}

export const ScoreCutsApi = {
  /**
   * Obtener todos los umbrales (score cuts) de un área específica
   * @param olympiadId ID de la olimpiada
   * @param areaId ID del área
   */
  getScoreCuts: async (olympiadId: number, areaId: number) => {
    try {
      const response = await ohSansiApi.get(
        `/olympiads/${olympiadId}/areas/${areaId}/score-cuts`
      );
      return response.data; // Contiene data: [ ... ]
    } catch (error: any) {
      console.error("Error al obtener los umbrales:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Actualizar o asignar un nuevo umbral
   * @param olympiadId ID de la olimpiada
   * @param areaId ID del área
   * @param data Datos del umbral a registrar
   *  {
   *     "phase_id": number,
   *     "level_id": number,
   *     "score_cut": number
   *  }
   */
  updateScoreCuts: async (
    olympiadId: number,
    areaId: number,
    data: { phase_id: number; level_id: number; score_cut: number }
  ) => {
    try {
      const response = await ohSansiApi.post(
        `/olympiads/${olympiadId}/areas/${areaId}/score-cuts`,
        data
      );
      return response.data; 
    } catch (error: any) {
      console.error("Error al actualizar el umbral:", error);
      throw error.response?.data || error;
    }
  },
};
