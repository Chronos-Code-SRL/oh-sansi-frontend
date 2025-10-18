import { ohSansiApi } from "../ohSansiApi";

const TOKEN_KEY = "ohsansi_token";

// Login
export const login = async (email: string, password: string) => {
  const res = await ohSansiApi.post("/login", { email, password });
  const token = res.data.token;
  localStorage.setItem(TOKEN_KEY, token); // Guardar token en localStorage
  return token;
};

// Logout
export const logout = async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    await ohSansiApi.post(
      "/logout",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
  localStorage.removeItem(TOKEN_KEY);
};

// Obtener token guardado
export const getToken = () => localStorage.getItem(TOKEN_KEY);

// Revisar si usuario está logueado
export const isLoggedIn = () => !!getToken();
