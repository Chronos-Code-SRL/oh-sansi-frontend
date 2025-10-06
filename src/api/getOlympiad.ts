import { ohSansiApi } from "./ohSansiApi";

// Función para obtener las olimpiadas
export const serviceGetOlympiads = {
    getOlympiads: async () => {
        try {
            return ohSansiApi.get("/olympiads");
        } catch (error) {
            throw error;
        }
    },
    getOlympiadById: async (id: number) => {
        try {
            const response = await ohSansiApi.get(`/olympiads/${id}`);
            const data = response.data as { olympiad: { name: string } };
            return data.olympiad.name;
        } catch (error) {
            throw error;
        }
    },
};



