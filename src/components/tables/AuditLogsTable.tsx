import { useEffect, useState } from "react";
import { getAuditLogs } from "../../api/services/auditServices";
import { AuditLog } from "../../types/auditInterfaces";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import ScrollToTopButton from "../ui/button/ScrollToTopButton";
import FloatingDownloadButton from "../filter/FloatingDownloadButton";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";
import SearchBar from "../Grade/Searcher";

export const AuditLogsTable = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const loadLogs = async () => {
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
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [])

  const filteredLogs = logs
    .filter((log) => {
      if (!log.user) return false;

      const { id, name, email } = log.user;

      return (
        id &&
        name && name.trim() !== "" &&
        email && email.trim() !== ""
      );
    })

    .filter((log) => {
    const created = new Date(log.created_at);

    if (!filterDay && !filterMonth && !filterYear) return true;

    const dayMatch = filterDay ? created.getDate() === Number(filterDay) : true;
    const monthMatch = filterMonth ? created.getMonth() + 1 === Number(filterMonth) : true;
    const yearMatch = filterYear ? created.getFullYear() === Number(filterYear) : true;

    return dayMatch && monthMatch && yearMatch;
  })

    // Buscador
  .filter((log) => {
    const text = search.toLowerCase();

    const userName = log.user?.name?.toLowerCase() ?? "";
    const userEmail = log.user?.email?.toLowerCase() ?? "";
    const contestantName = log.evaluation?.contestant?.name?.toLowerCase() ?? "";
    const contestantCi = log.evaluation?.contestant?.ci_document?.toLowerCase() ?? "";

    return (
      userName.includes(text) ||
      userEmail.includes(text) ||
      contestantName.includes(text) ||
      contestantCi.includes(text)
    );
  });

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const refreshLogs = () => {
    setCurrentPage(1);
    setSearch("");
    setFilterDay("");
    setFilterMonth("");
    setFilterYear("");
    loadLogs();
  };

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
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Historial de cambios en el registro de notas</h2>

          <button
            onClick={refreshLogs}
            className="px-4 py-2 bg-[#3756A6] text-white rounded-md hover:bg-[#2c458a]"
          >
            Refrescar
          </button>
        </div>

        <div className="space-y-4 mt-4">

          <div className="flex flex-col">
            <SearchBar
              onSearch={setSearch}
              placeholder="Buscar por usuario, email, CI, competidor..."
            />

          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Filtro por fecha</label>

            <div className="flex items-center gap-3">

              {/* Día */}
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="border rounded-md px-2 py-2 text-sm w-24"
              >
                <option value="">Día</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {/* Mes */}
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="border rounded-md px-2 py-2 text-sm w-28"
              >
                <option value="">Mes</option>
                {[
                  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
                  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
                ].map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>

              {/* Año */}
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="border rounded-md px-2 py-2 text-sm w-28"
              >
                <option value="">Año</option>
                {Array.from({ length: 6 }).map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>

            </div>
          </div>
      </div>

      </div>

        <div className="mt-6 overflow-x-auto rounded-xl ">
          <Table className="min-w-full border border-gray-200 rounded-lg text-sm text-center">
            <TableHeader className="bg-gray-100 border-b border-border bg-muted/50">
              <TableRow>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Fecha</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Usuario Editor</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Email Editor</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Competidor</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">CI</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Área</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Fase</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Puntaje Anterior</th>
                <th className="px-5 py-4 text-sm font-semibold text-foreground">Puntaje Nuevo</th>
              </TableRow>
            </TableHeader>

            <TableBody> 
              {paginatedLogs.map((log) => (
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

        {/* PAGINACIÓN */}
        <div className="flex justify-center mt-4 space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 bg-[#3756A6] text-white hover:bg-[#2c458a]"
          >
            Anterior
          </button>

          <span className="px-3 py-1">
             {currentPage} de {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 bg-[#3756A6] text-white hover:bg-[#2c458a]"
          >
            Siguiente
          </button>
        </div>

          <FloatingDownloadButton
            hasData={logs.length > 0}
            onPDF={handleDownloadPDF}
            onCSV={handleDownloadCSV}
            onExcel={handleDownloadExcel}
          />
          <ScrollToTopButton />
      </div>
  );
};
