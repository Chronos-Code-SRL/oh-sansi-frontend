import { ohSansiApi } from "../api/ohSansiApi";
import { UploadCsvResponse } from "../types/CompetitorUpload";

const UPLOAD_CSV_URL = "/competitors/upload-csv";
const DOWNLOAD_ERROR_URL = "/competitors/download-error-csv";

// Subir archivos CSV y asociarlos a una olimpiada
export const uploadCompetitorCsv = async (
  files: File[],
  olympiadId: number
): Promise<UploadCsvResponse> => {
  const formData = new FormData();

  files.forEach((file) => formData.append("files[]", file));
  formData.append("olympiad_id", String(olympiadId));

  const res = await ohSansiApi.post<UploadCsvResponse>(UPLOAD_CSV_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

// Descargar un archivo de errores generado
export const downloadErrorCsv = async (filename: string): Promise<Blob> => {
  const res = await ohSansiApi.get(`${DOWNLOAD_ERROR_URL}/${filename}`, {
    responseType: "blob",
  });
  return res.data;
};
