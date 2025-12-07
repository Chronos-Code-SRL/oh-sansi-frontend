// Nota: Se usan uniones de string para clasificación; enums importados no son necesarios

export interface Contestant {
    evaluation_id: number;
    contestant_id: number;
    first_name: string;
    last_name: string;
    gender: string;
    ci_document: string;
    school_name: string;
    department: string;
    score: number | null;
    description: string | null;
    level_name: string;
    grade_name: string;
    status: boolean;
    classification_status?: "clasificado" | "no_clasificado" | "descalificado" | null;
    classification_place: string | null;
}

//Type for comment and score update
export interface EvaluationUpdatePayload {
    score?: number | null;
    description?: string | null;
    classification_place?: string | null;
};

export interface Evaluation {
    id: number;
    contestant_id: number;
    score: number | null;
    status: boolean;
    description: string | null;
    updated_at: string;
    evaluation_id?: number; // algunos endpoints devuelven evaluation_id en vez de id
    classification_status?: "clasificado" | "no_clasificado" | "descalificado" | null;
    classification_place?: number | null;
}

export interface FilterList {
    contestant_id: number;
    evaluation_id: number;
    first_name: string;
    last_name: string;
    ci_document: string;
    gender: string;
    department: string;
    score: number | null;
    status: boolean;
    area_name: string;
    grade_name: string;
    level_name: string;
}

export interface ConstestantRanked {
    first_name: string;
    last_name: string;
    ci_document: string;
    grade_name: string;
    classification_status: "clasificado" | "no_clasificado" | "desclasificado" | null;
    score: number | null;
}

export interface AwardWinningCompetitorsResponse {
    contestants: AwardWinningCompetitors[];
    status: number;
}
export interface AwardWinningCompetitors {
    contestant_id: number;
    first_name: string;
    last_name: string;
    ci_document: string;
    school_name: string;
    department: string;
    classification_place: "Oro" | "Plata" | "Bronce" | "Mención de Honor" | null;
}
export interface ContestantStats {
    total: number;
    classified: number;
    no_classified: number;
    disqualified: number;
}

export interface ContestantMedalList {
    contestants: ContestantMedal[];
    status: number;
}

export interface ContestantMedal {
    contestant_id: number;
    first_name: string;
    last_name: string;
    school_name: string;
    ci_document: string;
    area_name: string;
    level_name: string;
    score: number | null;
    evaluation_id: number;
    classification_place: string | null;
}

export interface AwardMedalsPayload {
    gold: string;
    silver: string;
    bronze: string;
    honorable_mention: string;
}

export interface AwardMedalsResponse {
    message: string;
}

//For update medals
// export interface UpdateMedalPayload {
//     classification_place?: number | null;
// }

export interface numberOfMedalsByArea {
    number_gold: number;
    number_silver: number;
    number_bronze: number;
    number_honorable_mention: number;
}