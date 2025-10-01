import { ohSansiApi } from "./ohSansiApi";


// export interface OlympiadData {
//     name: string;
//     number_of_phases: number;
//     edition: string;
//     start_date: String;
//     end_date: String;
// }

export const createOlympiad = {
    postOlympiad: async function (data: any) {
        try {
            return ohSansiApi.post("/olympiads", data)
        } catch (error) {
            throw error;
        }
    }
}