import { ohSansiApi } from "../api/ohSansiApi";
import { Olympiad, AllOlympiads, OlympiadPayload } from "../types/Olympiad";

const OLYMPIADS_URL = `/olympiads`;

//para obtener olimpiadas con todos sus datos
export const getOlympiads = async (): Promise<Olympiad[]> => {
  const res = await ohSansiApi.get<AllOlympiads>(OLYMPIADS_URL);
  return res.data.olympiads;
};

export const postOlympiad = async (
  olympiadData: OlympiadPayload,
): Promise<OlympiadPayload> => {
  console.log('[postOlympiad] Enviando olimpiada:', olympiadData);
  const res = await ohSansiApi.post<OlympiadPayload>(OLYMPIADS_URL, olympiadData);
  return res.data;
};
