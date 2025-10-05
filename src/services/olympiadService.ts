import { ohSansiApi } from "../api/ohSansiApi";
import { Olympiad, AllOlympiads } from "../types/Olympiad";

const OLYMPIADS_URL = `/olympiads`;

//para obtener olimpiadas con todos sus datos
export const getOlympiads = async (): Promise<Olympiad[]> => {
  const res = await ohSansiApi.get<AllOlympiads>(OLYMPIADS_URL);
  return res.data.olympiads; 
};



