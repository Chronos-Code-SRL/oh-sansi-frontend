export interface Contestant {
    contestant_id: number,
    first_name: string,
    last_name: string,
    gender: string,
    ci_document: string,
    school_name: string,
    department: string,
    score: number | null,
    description: string | null,
    //level: string | null,
    //grade: string | null,
    status: boolean,
}