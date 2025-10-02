import axios from "axios";
import { Contestant } from "../types/Contestant";

const API_URL = "http://localhost:8000/upload-csv";

export const uploadCsv = async (
  files: File[],
  olympiadId: number
): Promise<Contestant> => {
  const formData = new FormData();
  formData.append("olympiad_id", olympiadId.toString());
  files.forEach((file) => {
    formData.append("files[]", file);
  });

  const response = await axios.post<Contestant>(
    `${API_URL}/competitor/upload-csv`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data;
};

export const downloadErrorCsv = (filename: string) => {
  window.open(`${API_URL}/competitor/download-error-csv/${filename}`, "_blank");
};