import { Phase } from "../../types/Phase";
import { ohSansiApi } from "../ohSansiApi";

export const getOlympiadPhases = async (olympiadId: number): Promise<Phase[]> => {
  const res = await ohSansiApi.get(`/olympiads/${olympiadId}/phases`);
  return res.data.phases; // según tu ejemplo del backend
};