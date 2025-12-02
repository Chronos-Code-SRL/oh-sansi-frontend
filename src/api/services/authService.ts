import { ohSansiApi } from "../ohSansiApi";
import { LoginResponse,User, UserAreasResponse } from "../../types/User";

const TOKEN_KEY = "ohsansi_token";
const USER_KEY = "ohsansi_user";
const LOGIN = `/login`;
const LOGOUT = `/logout`;
const USER_AREAS_URL = "/user/areas";

// Login
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await ohSansiApi.post<LoginResponse>(LOGIN, { email, password });
  localStorage.setItem(TOKEN_KEY, res.data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));

  return res.data;
};

// Logout
export const logout = async (): Promise<void> => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    try {
      await ohSansiApi.post(
        LOGOUT,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Obtener token guardado
export const getToken = () => localStorage.getItem(TOKEN_KEY);

// Revisar si usuario está logueado
export const isLoggedIn = () => !!getToken();

//  Obtener usuario logueado
export const getUser = (): User | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const getRoleName = (user: User | null): string[] => {
  if (!user) return [];
  return user.roles_id.map(role => role.name);
};


// Verificar rol
export const getRole = (requiredRoleId: number): boolean => {
  const user = getUser();
  if (!user) return false;
  return user.roles_id.some(role => role.id === requiredRoleId);
};


export const getUserAreas = async (idOlympiad: number): Promise<UserAreasResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error("No se encontró token. El usuario no está autenticado.");
  }
  const res = await ohSansiApi.get(`${USER_AREAS_URL}/${idOlympiad}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    areas: res.data.data,
    status: res.data.status,
  };
};