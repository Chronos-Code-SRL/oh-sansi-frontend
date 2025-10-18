import { ohSansiApi } from "../ohSansiApi";
import { LoginResponse } from "../../types/LoginResponse";

const TOKEN_KEY = "ohsansi_token";

// Login
export const login = async (email: string, password: string) => {
  const res = await ohSansiApi.post<LoginResponse>("/login", {
    email,
    password,
  });
  localStorage.setItem(TOKEN_KEY, res.data.token);
  return res.data;
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
