
import { ohSansiApi } from "../ohSansiApi";
import {AuditLogResponse,} from "../../types/auditInterfaces";

// export const getAuditLogs = async (): Promise<AuditLogResponse> => {
//   console.log("%c[AuditLogs] → Llamando endpoint...", "color: #3498db");
//   const res = await ohSansiApi.get<AuditLogResponse>(
//     "/evaluations/audit/logs",{
//       headers: {
//         Authorization: "Bearer 2|pCsejiBFqEzgDi9XztL5IQsvG9BLknWKckR4oFkxfc58d5b8",
//       },
//     }
//   );

//   return res.data;
// };

export const getAuditLogs = async (): Promise<AuditLogResponse> => {
  console.log("%c[AuditLogs] → Llamando endpoint...", "color: #3498db");

  const res = await ohSansiApi.get<AuditLogResponse>(
    "/evaluations/audit/logs"
  );

  return res.data;
};
