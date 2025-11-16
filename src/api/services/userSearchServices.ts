import { ohSansiApi } from "../ohSansiApi";

export const userSearchApi = {
  getOlympiadsActiveOrPlanning: async () => {
    try {
      return await ohSansiApi.get("/olympiads/status/active-or-planning");
    } catch (error) {
      throw error;
    }
  },

  searchUser: async (olympiadId: number, ci: string, roleId: number) => {
    try {
      const url = `/search-user/olympiad/${olympiadId}/ci/${ci}/role/${roleId}`;
      return await ohSansiApi.get(url);
    } catch (error) {
      throw error;
    }
  },
};
