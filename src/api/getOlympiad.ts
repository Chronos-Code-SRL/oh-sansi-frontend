import { ohSansiApi } from "./ohSansiApi";

// Función para obtener las olimpiadas
export const serviceGetOlympiads = {
    getOlympiads: async () => {
        try {
            return ohSansiApi.get("/olympiads"); // tu endpoint
        } catch (error) {
            throw error;
        }
    },
};



