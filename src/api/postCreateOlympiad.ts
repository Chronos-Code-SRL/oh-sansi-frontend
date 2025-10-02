import { ohSansiApi } from "./ohSansiApi";

export const createOlympiad = {
    postOlympiad: async function (data: any) {
        try {
            console.log('[createOlympiad.postOlympiad] Enviando a /olympiads con data:', data);
            return ohSansiApi.post("/olympiads", data)
        } catch (error) {
            console.error('[createOlympiad.postOlympiad] Error al enviar olimpiada:', error);
            throw error;
        }
    }
}