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
}

//Type for comment and score update
export interface EvaluationUpdatePayload {
    score?: number | null;
    description?: string | null;
};

export interface Evaluation {
    id: number;
    contestant_id: number;
    score: number | null;
    status: boolean;
    description: string | null;
    updated_at: string; // ISO
}

export interface FilterList{
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