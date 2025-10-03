import { ohSansiApi } from "./ohSansiApi";

const endpoint = "/register";

export const registerApi = {
    postRegister: async function (data:any) {
        try { 
            return ohSansiApi.post(endpoint, data)
        }catch (error) {
            throw error;
        }
    }
}
