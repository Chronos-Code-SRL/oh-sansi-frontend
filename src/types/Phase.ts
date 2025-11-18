export interface Phase{
    id: number;
    name: string;
    order: number;
}

export interface PhaseStatus {
    phase_id: number;
    phase_name: string;
    phase_order: number;
    status: string; // Activa | Terminada | Sin Empezar
    score_cut: number;
    max_score: number;
}

export interface PhaseResponse {
    olympiad_id: number;
    area_id: number;
    level_id: number;
    phase_status: PhaseStatus;
    status: number;
}