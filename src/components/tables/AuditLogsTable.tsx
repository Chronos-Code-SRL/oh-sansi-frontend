import { useEffect, useState } from "react";
import { getAuditLogs } from "../../api/services/auditServices";
import { AuditLog } from "../../types/auditInterfaces";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import ScrollToTopButton from "../ui/button/ScrollToTopButton";
import FloatingDownloadButton from "../filter/FloatingDownloadButton";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";

export const AuditLogsTable = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        setError(null);
        console.log("%c[AuditLogsTable] → Cargando logs...", "color: orange");
        const response = await getAuditLogs();
        console.log("%c[AuditLogsTable] ← Logs obtenidos:", "color: green", response);
        setLogs(response.logs ?? []);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los registros de auditoría.");
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  if (loading) return <p>Cargando historial...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const formatAuditLogsToRows = () => {
    return logs.map((log) => ({
      Fecha: new Date(log.created_at).toLocaleString(),
      Usuario: log.user.name,
      Email: log.user.email,
      Competidor: log.evaluation.contestant.name,
      CI: log.evaluation.contestant.ci_document,
      Área: log.evaluation.area.name,
      Fase: log.evaluation.phase.name,
      "Puntaje Anterior": log.changes.old_values.score ?? "-",
      "Puntaje Nuevo": log.changes.new_values.score ?? "-",
    }));
  };

  const handleDownloadCSV = () => {
    if (!logs.length) return;

    const rows = formatAuditLogsToRows();

    const headers = Object.keys(rows[0]).join(",");
    const body = rows
      .map((r) =>
        Object.values(r)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const csv = `${headers}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "historial_auditoria.csv";
    link.click();
  };

  const handleDownloadPDF = () => {
    if (!logs.length) return;

    const rows = formatAuditLogsToRows();
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(14);
    doc.text("Historial de Cambios", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [Object.keys(rows[0])],
      body: rows.map((r) => Object.values(r)),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [40, 40, 40] },
    });

    doc.save("historial_auditoria.pdf");
  };

  const handleDownloadExcel = () => {
    if (!logs.length) return;

    const rows = formatAuditLogsToRows();

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Auditoria");

    XLSX.writeFile(workbook, "historial_auditoria.xlsx");
  };



  return (
    <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
      <div className="mx-auto w-full space-y-8">
        <h2 className="block text-left text-lg font-semibold mb-3">Historial de Cambios</h2>

        <div className="mt-6 overflow-x-auto rounded-xl ">
          <Table className="min-w-full border border-gray-200 rounded-lg text-sm text-center">
            <TableHeader className="bg-gray-100 border-b border-border bg-muted/50">
              <TableRow>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Fecha</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Usuario</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Email</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Competidor</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">CI</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Área</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Fase</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Puntaje Anterior</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Puntaje Nuevo</th>
              </TableRow>
            </TableHeader>

            <TableBody> 
              {logs.map((log) => (
                <TableRow key={log.audit_id} className="hover:bg-gray-50 border-b border-border last:border-0">
                  <td className="px-5 py-4 text-sm items-center text-center">
                    {new Date(log.created_at).toLocaleString()}
                  </td>

                  <td className="px-5 py-4 text-sm items-center whitespace-nowrap text-center">
                    {log.user.name}
                  </td>
                  <td className="px-5 py-4 text-sm items-center whitespace-nowrap text-center">
                    {log.user.email}
                  </td>

                  <td className="px-5 py-4 text-sm items-center whitespace-nowrap text-center">
                    {log.evaluation.contestant.name}
                  </td>

                  <td className="px-5 py-4 text-sm items-center whitespace-nowrap text-center">
                    {log.evaluation.contestant.ci_document}
                  </td>

                  <td className="px-5 py-4 text-sm items-center whitespace-nowrap text-center">
                    {log.evaluation.area.name}
                  </td>

                  <td className="px-5 py-4 text-sm items-center whitespace-nowrap text-center">
                    {log.evaluation.phase.name}
                  </td>

                  <td className="px-5 py-4 text-sm items-center whitespace-nowrap text-center">
                    {log.changes.old_values.score ?? "-"}
                  </td>

                  <td className="px-5 py-4 text-sm items-center whitespace-nowrap text-center">
                    {log.changes.new_values.score ?? "-"}
                  </td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          <FloatingDownloadButton
                    hasData={logs.length > 0}
                    onPDF={handleDownloadPDF}
                    onCSV={handleDownloadCSV}
                    onExcel={handleDownloadExcel}
                  />
          <ScrollToTopButton />
        </div>
    </div>
  );
};
