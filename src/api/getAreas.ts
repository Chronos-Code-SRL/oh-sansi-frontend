import { ohSansiApi } from "./ohSansiApi";

export const areaService = {
    getAreas: async () => {
        try {
            return ohSansiApi.get("/areas"); // tu endpoint
        } catch (error) {
            throw error;
        }
    },
};
