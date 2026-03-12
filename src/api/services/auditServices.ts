import { ohSansiApi } from "../ohSansiApi";
import { AuditLogResponse } from "../../types/auditInterfaces";
import { getToken } from "../services/authService";

export const getAuditLogs = async (): Promise<AuditLogResponse> => {
  const token = getToken();

  const res = await ohSansiApi.get<AuditLogResponse>(
    "/evaluations/audit/logs",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
};
