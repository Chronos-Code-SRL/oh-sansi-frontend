import { useEffect, useState } from "react";
import { getCertificateContestants } from "../../api/services/contestantService";
import { CertificateContestant } from "../../types/Contestant";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import { FilterDropdown } from "../filter/FilterDropdown";
import { getLevelsByOlympiadAndArea } from "../../api/services/levelGradesService";
import { Level } from "../../types/Level";
import ScrollToTopButton from "../ui/button/ScrollToTopButton";
import FloatingDownloadButton from "../filter/FloatingDownloadButton";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";
import ClearFiltersButton from "../ui/button/CleanFiltersButton";

interface Props {
  idOlympiad: number;
  idArea: number;
}

export default function CertificatedTable({ idOlympiad, idArea }: Props) {
  const [rows, setRows] = useState<CertificateContestant[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedNivel, setSelectedNivel] = useState<string[]>([]);
  const [_loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const handleClearFilters = () => {
    setSelectedNivel([]);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        if (!idOlympiad || !idArea) return;

        const [levelsData, contestants] = await Promise.all([
          getLevelsByOlympiadAndArea(idOlympiad, idArea),
          getCertificateContestants(idOlympiad, idArea),
        ]);

        setLevels(levelsData);

        const levelOrder = levelsData.reduce((acc, level, index) => {
          acc[level.name] = index + 1;
          return acc;
        }, {} as Record<string, number>);

        const normalized = contestants
          .map((item) => ({
            name: item.name ?? "",
            last_name: item.last_name ?? "",
            school_name: item.school_name ?? "",
            department: item.department ?? "",
            area: item.area ?? "",
            level: item.level ?? "",
            score: item.score ?? 0,
            classification_place: item.classification_place ?? null,
            teacher: item.teacher ?? "",
            area_responsible: item.area_responsible ?? "",
          }))
          .filter((item) => item.classification_place !== null);

        const medalOrder: Record<string, number> = {
          Oro: 1,
          Plata: 2,
          Bronce: 3,
          "Mención de Honor": 4,
        };

        const sorted = [...normalized].sort((a, b) => {
          const lvlA = levelOrder[a.level] ?? 999;
          const lvlB = levelOrder[b.level] ?? 999;
          if (lvlA !== lvlB) return lvlA - lvlB;

          const mA = medalOrder[a.classification_place ?? ""] ?? 99;
          const mB = medalOrder[b.classification_place ?? ""] ?? 99;

          return mA - mB;
        });

        setRows(sorted);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos o no se avalaron todos los niveles de esta área. Asegúrese de avalar todos los niveles.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [idOlympiad, idArea]);

  if (error) return <p className="text-red-600">{error}</p>;

  const filteredRows = rows.filter((r) => {
    if (selectedNivel.length === 0) return true;
    return selectedNivel.includes(r.level.toLowerCase());
  });

  const formatCertificateRows = () => {
    return filteredRows.map((c) => ({
      Nombre: c.name,
      Apellido: c.last_name,
      Colegio: c.school_name,
      Departamento: c.department,
      Área: c.area,
      Nivel: c.level,
      Puntaje: c.score,
      Puesto: c.classification_place,
      Profesor: c.teacher,
      "Responsable Academico": c.area_responsible,
    }));
  };

  const handleDownloadCSV = () => {
    const rows = formatCertificateRows();
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
    link.download = "lista_para_certificados.csv";
    link.click();
  };

  const handleDownloadPDF = () => {
    const rows = formatCertificateRows();
    if (!rows.length) return;

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(14);
    doc.text("Lista para Certificados", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [Object.keys(rows[0])],
      body: rows.map((r) => Object.values(r)),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [40, 40, 40] },
    });

    doc.save("lista_para_certificados.pdf");
  };

  const handleDownloadExcel = () => {
    const rows = formatCertificateRows();
    if (!rows.length) return;

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Certificados");

    XLSX.writeFile(workbook, "lista_para_certificados.xlsx");
  };

  return (
    <div className="mx-auto w-full space-y-4">
      <h2 className="block text-left text-lg font-semibold mb-3">
        Lista para generar Certificados
      </h2>

      <div className="flex flex-wrap items-center gap-4 ">
        <FilterDropdown
          label="Nivel"
          options={levels.map((lvl) => ({
            label: lvl.name,
            value: lvl.name.toLowerCase(),
          }))}
          selectedValues={selectedNivel}
          onChange={setSelectedNivel}
        />
        <ClearFiltersButton onClick={handleClearFilters} />
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl">
        <Table className="min-w-full border border-gray-200 rounded-xl text-sm text-center">
          <TableHeader className="bg-gray-100 border-b border-border bg-muted/50">
            <TableRow>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Nombre</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Apellido</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Colegio</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Departamento</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Área</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Nivel</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Puntaje</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Puesto</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Profesor</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Responsable Academico</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((c, i) => (
              <TableRow key={i} className="hover:bg-gray-50 border-b border-border last:border-0">
                <td className="px-5 py-4 text-sm">{c.name}</td>
                <td className="px-5 py-4 text-sm">{c.last_name}</td>
                <td className="px-5 py-4 text-sm">{c.school_name}</td>
                <td className="px-5 py-4 text-sm">{c.department}</td>
                <td className="px-5 py-4 text-sm">{c.area}</td>
                <td className="px-5 py-4 text-sm">{c.level}</td>
                <td className="px-5 py-4 text-sm">{c.score}</td>
                <td className="px-5 py-4 text-sm">{c.classification_place}</td>
                <td className="px-5 py-4 text-sm">{c.teacher}</td>
                <td className="px-5 py-4 text-sm">{c.area_responsible}</td>
              </TableRow>
            ))}
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

