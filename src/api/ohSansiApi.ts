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

// Interceptor para convertir scores de string a number
// (necesario porque PostgreSQL numeric(10,2) devuelve strings)
ohSansiApi.interceptors.response.use((response) => {
  // Evitar transformar respuestas binarias (blob/arraybuffer)
  if (response?.config?.responseType === 'blob' || response?.config?.responseType === 'arraybuffer') {
    return response;
  }

  // También evitar si data ya es un Blob
  if (typeof Blob !== 'undefined' && response?.data instanceof Blob) {
    return response;
  }

  // Función recursiva para convertir campos score de string a number
  const parseScoreFields = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(parseScoreFields);
    }
    
    if (typeof obj === 'object') {
      const parsed: any = {};
      for (const key in obj) {
        if (key === 'score' && typeof obj[key] === 'string') {
          // Convertir score string a number
          const num = parseFloat(obj[key]);
          parsed[key] = isNaN(num) ? null : num;
        } else {
          parsed[key] = parseScoreFields(obj[key]);
        }
      }
      return parsed;
    }
    
    return obj;
  };
  
  if (response.data) {
    response.data = parseScoreFields(response.data);
  }
  
  return response;
}, (error) => {
  // Pasar errores sin modificar
  return Promise.reject(error);
});