import { ohSansiApi } from "./ohSansiApi";

export const areaService = {
    getAreas: async () => {
        try {
            return ohSansiApi.get("/areas"); // tu endpoint
        } catch (error) {
            throw error;
        }
    },
    getAreasByOlympiadId: async (id: number) => {
        try {
            const response = await ohSansiApi.get(`/olympiads/${id}/areas`);
            const data = response.data as {
                areas: { id: number; name: string }[]; // Define la estructura esperada
            };
            // Retorna un array con id y name de cada área
            return data.areas.map((area) => ({
                id: area.id,
                name: area.name,
            }));
        } catch (error) {
            throw error;
        }
    },
};
