export interface LevelGrade {
  id: number;
  level_name: string;
  grade_name: string;
  score_cut: number;
}

export interface PhaseScoreCuts {
  phase_id: number;
  phase_name: string;
  level_grades: LevelGrade[];
}

export interface ScoreCutsResponse {
  area_id: number;
  area_name: string;
  phases: PhaseScoreCuts[];
}

export interface UpdateScoreCutPayload {
  phase_id: number;
  level_id: number;
  score_cut: number;
}
