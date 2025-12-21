export interface TieRequiringResolution {
  medal_type: string;
  score: number;
  tied_count: number;
  available_in_category: number;
  overflow_to?: string;
  evaluations: {
    evaluation_id: number;
    contestant_name: string;
    score: number;
  }[];
}

export interface MedalAdjustment {
  evaluation_id: number;
  new_medal: string;
  justification: string;
}
