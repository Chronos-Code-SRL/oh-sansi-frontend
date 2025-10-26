export interface Grade {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Level {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface LevelGrade {
  id: number;
  level_id: number;
  grade_id: number;
  olympiad_area_id: number;
  created_at: string;
  updated_at: string;
  level: Level;
  grade: Grade;
}

export interface ScoreCut {
  id: number;
  olympiad_area_phase_id: number;
  level_grade_id: number;
  score_cut: number;
  created_at: string;
  updated_at: string;
  level_grade: LevelGrade;
}

export interface Phase {
  id: number;
  name: string;
  order?: number;
  created_at: string;
  updated_at: string;
}

export interface ScoreCutPhaseData {
  id: number;
  olympiad_area_id: number;
  phase_id: number;
  created_at: string;
  updated_at: string;
  olympiad_area_phase_level_grades: ScoreCut[];
  phase: Phase;
}

export interface ScoreCutResponse {
  message?: string;
  data: ScoreCutPhaseData[];
}

export interface ScoreCutUpdateRequest {
  phase_id: number;
  level_id: number;
  score_cut: number;
}

export interface ScoreCutUpdateResponse {
  message: string;
  data: ScoreCutPhaseData;
  level_name: string;
  level_id: number;
  score_cut: number;
  affected_grades_count: number;
  created_count: number;
  updated_count: number;
  status: number;
}
