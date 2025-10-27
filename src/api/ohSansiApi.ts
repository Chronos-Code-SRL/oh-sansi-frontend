import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const ohSansiApi = axios.create({
    baseURL: `${BASE_URL}/api`
})

// Interceptor para agregar token en cada request
ohSansiApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('ohsansi_token'); // obtenemos token del localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});