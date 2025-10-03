import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const ohSansiApi = axios.create({
    baseURL: `${BASE_URL}/api`
})