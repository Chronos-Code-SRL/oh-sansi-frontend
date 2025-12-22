//Payload for creating medals
export interface CreateMedalsPayload {
    gold: number;
    silver: number;
    bronze: number;
    honorable_mention: number;
    minimum_classification_score: number;
}

export interface Medals {
    id: number;
    olympiad_area_id: number;
    gold: number;
    silver: number;
    bronze: number;
    honorable_mention: number;
    minimum_classification_score: number;
    created_at: Date;
    updated_at: Date;
}
