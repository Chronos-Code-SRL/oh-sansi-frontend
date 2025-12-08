import { useEffect, useState } from "react";
import { getLevelsByOlympiadAndArea } from "../../api/services/levelGradesService";
import { getContestantsClassifieds } from "../../api/services/contestantService";
import { LevelOption } from "../../types/Level";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { FilterDropdown } from "../filter/FilterDropdown";
import { FilterDropdownNota } from "../filter/FilterDropDownNota";
import ScrollToTopButton from "../ui/button/ScrollToTopButton";
import FloatingDownloadButton from "../filter/FloatingDownloadButton";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { autoTable } from "jspdf-autotable";
import ClearFiltersButton from "../ui/button/CleanFiltersButton";

interface Props {
  idPhase: number;
  idOlympiad: number;
  idArea: number;
}

export default function ClassifiedByLevelSimple({
  idPhase,
  idOlympiad,
  idArea,
}: Props) {
  const [levels, setLevels] = useState<LevelOption[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterNivel, setFilterNivel] = useState<string[]>([]);
  const [filterEstado, setFilterEstado] = useState<string[]>([]);
  const [notaInicial, setNotaInicial] = useState(0);
  const [notaFinal, setNotaFinal] = useState(100);

  // Cargar niveles
  useEffect(() => {
    async function loadLevels() {
      try {
        const lvl = await getLevelsByOlympiadAndArea(idOlympiad, idArea);
        setLevels(lvl);
      } catch (err) {
        setError("No se pudieron cargar los niveles.");
      }
    }
    loadLevels();
  }, [idOlympiad, idArea]);

  // Cargar concursantes por nivel
  useEffect(() => {
    if (levels.length === 0) return;

    async function loadContestants() {
      setLoading(true);
      try {
        const promises = levels.map(async (lvl) => {
          try {
            const data = await getContestantsClassifieds(
              idOlympiad,
              idArea,
              idPhase,
              lvl.id
            );
            return { level: lvl, data };
          } catch {
            return { level: lvl, data: [] };
          }
        });

        const results = await Promise.all(promises);

        const merged = results
          .flatMap((g) =>
            g.data.map((c) => ({
              ...c,
              levelId: g.level.id,
              levelName: g.level.name,
            }))
          )
          .sort((a, b) => a.levelId - b.levelId);

        setRows(merged);
      } catch {
        setError("Error general al cargar los concursantes.");
      } finally {
        setLoading(false);
      }
    }

    loadContestants();
  }, [levels, idOlympiad, idArea, idPhase]);

  if (loading) return <p>Cargando datos…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  // Opciones de estado
  const estadoOptions = [
    { label: "Clasificado", value: "clasificado" },
    { label: "No Clasificado", value: "no_clasificado" },
  ];

  // 🔎 FILTRADO FINAL
  const filteredRows = rows.filter((r) => {
    const byNivel =
      filterNivel.length === 0 ||
      filterNivel.includes(r.levelName.toLowerCase());

    const byEstado =
      filterEstado.length === 0 ||
      filterEstado.includes(r.classification_status);

    const score = Number(r.score ?? -1);

    const byNota =
      score >= notaInicial &&
      score <= notaFinal;

    return byNivel && byEstado && byNota;
  });

  const formatRows = () => {
    return filteredRows.map((c) => ({
      Nombre: c.first_name,
      Apellido: c.last_name,
      CI: c.ci_document,
      Nivel: c.levelName,
      Estado: c.classification_status
        ? c.classification_status.replace("_", " ")
        : "—",
      Nota: c.score ?? "—",
    }));
  };

  // Descargar en PDF
  const handleDownloadPDF = () => {
    const rows = formatRows();
    if (!rows.length) return;

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(14);
    doc.text("Reporte de clasificados", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [Object.keys(rows[0])],
      body: rows.map((r) => Object.values(r)),
      styles: { halign: "center", valign: "middle" },
      headStyles: { fillColor: [23, 86, 166] },
    });

    doc.save("reporte_clasificados.pdf");
  };

  // Descargar en CSV
  const handleDownloadCSV = () => {
    const rows = formatRows();
    if (!rows.length) return;

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
    link.download = "reporte_clasificados.csv";
    link.click();
  };

  // Descargar en Excel (XLSX)
  const handleDownloadExcel = () => {
    const rows = formatRows();
    if (!rows.length) return;

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Concursantes");

    XLSX.writeFile(workbook, "reporte_clasificados.xlsx");
  };

  return (
    <div className="mx-auto w-full space-y-4">
      <h2 className="block text-left text-lg font-semibold mb-3">
        Concursantes Clasificados
      </h2>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h1>Filtrar por:</h1>
        <FilterDropdown
          label="Nivel"
          options={levels.map((lvl) => ({
            label: lvl.name,
            value: lvl.name.toLowerCase(),
          }))}
          selectedValues={filterNivel}
          onChange={setFilterNivel}
        />

        <FilterDropdown
          label="Estado"
          options={estadoOptions}
          selectedValues={filterEstado}
          onChange={setFilterEstado}
        />

        <FilterDropdownNota
          label="Nota"
          initialValue={0}
          finalValue={100}
          onConfirm={(min, max) => {
            setNotaInicial(min);
            setNotaFinal(max);
          }}
        />
        <ClearFiltersButton
          onClick={() => {
            setFilterNivel([]);
            setFilterEstado([]);
            setNotaInicial(0);
            setNotaFinal(100);
          }}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl">
        <Table className="min-w-full border border-gray-200 text-sm text-center">
          <TableHeader className="bg-gray-100 border-b border-border bg-muted/50">
            <TableRow>
              <th className="px-5 py-4">Nombre</th>
              <th className="px-5 py-4">Apellido</th>
              <th className="px-5 py-4">CI</th>
              <th className="px-5 py-4">Nivel</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Nota</th>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-3 text-gray-500">
                  No hay concursantes registrados.
                </td>
              </tr>
            ) : (
              filteredRows.map((c, idx) => (
                <TableRow
                  key={idx}
                  className="hover:bg-gray-50 border-b border-border last:border-0"
                >
                  <td className="px-5 py-4">{c.first_name}</td>
                  <td className="px-5 py-4">{c.last_name}</td>
                  <td className="px-5 py-4">{c.ci_document}</td>
                  <td className="px-5 py-4">{c.levelName}</td>
                  <td className="px-5 py-4">
                    <Badge
                      color={
                        c.classification_status === "clasificado"
                          ? "success"
                          : c.classification_status === "no_clasificado"
                          ? "error"
                          : "neutral"
                      }
                    >
                      {c.classification_status
                        ? c.classification_status.replace("_", " ")
                        : "—"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">{c.score ?? "—"}</td>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <FloatingDownloadButton
        hasData={filteredRows.length > 0}
        onPDF={handleDownloadPDF}
        onCSV={handleDownloadCSV}
        onExcel={handleDownloadExcel}
      />
      <ScrollToTopButton />
    </div>
  );
}
