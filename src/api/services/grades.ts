import { ohSansiApi } from "../ohSansiApi";

export const gradesService = {
    getGrades: async () => {
        try {
            const response = await ohSansiApi.get("/grades");
            const data = response.data as { grades: { id: number; name: string }[] };
            return data.grades.map((grade: { id: number; name: string }) => ({
                id: grade.id,
                name: grade.name,
            }));
        } catch (error) {
            throw error;
        }
    },
};
