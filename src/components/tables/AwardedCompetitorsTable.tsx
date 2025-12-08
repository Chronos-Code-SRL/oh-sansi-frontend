import { useEffect, useState } from "react";
import { getAwardWinningCompetitors } from "../../api/services/contestantService";
import { AwardWinningCompetitors } from "../../types/Contestant";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { getLevelsByOlympiadAndArea } from "../../api/services/levelGradesService";
import { FilterDropdown } from "../filter/FilterDropdown";
import ScrollToTopButton from "../ui/button/ScrollToTopButton";
import FloatingDownloadButton from "../filter/FloatingDownloadButton";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { autoTable } from "jspdf-autotable";
import ClearFiltersButton from "../ui/button/CleanFiltersButton";

interface Props {
  idOlympiad: number;
  idArea: number;
}

// 🟢 Tipo extendido SOLO para esta tabla
type AwardedRow = AwardWinningCompetitors & {
  level_name: string;
  area_name: string;
};

export default function AwardedTable({ idOlympiad, idArea }: Props) {
  const [rows, setRows] = useState<AwardedRow[]>([]);
  const [levels, setLevels] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Filtros
  const [filterNivel, setFilterNivel] = useState<string[]>([]);
  const [filterDepartamento, setFilterDepartamento] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        if (!idOlympiad || !idArea) return;

        //  Ejecutar ambas APIs en paralelo
        const [levelsData, data] = await Promise.all([
          getLevelsByOlympiadAndArea(idOlympiad, idArea),
          getAwardWinningCompetitors(idOlympiad, idArea),
        ]);

        // 1) Setear niveles
        setLevels(levelsData);

        const levelOrder = levelsData.reduce((acc, level, index) => {
          acc[level.name] = index + 1;
          return acc;
        }, {} as Record<string, number>);

        // 2) Normalizar datos
        const normalized: AwardedRow[] = data.map((item: any) => ({
          contestant_id: item.contestant_id,
          first_name: item.first_name ?? item.firstName ?? "",
          last_name: item.last_name ?? item.lastName ?? "",
          ci_document: item.ci_document ?? "",
          school_name: item.school_name ?? "",
          department: item.department ?? item.depto ?? "",
          classification_place:
            item.classification_place ??
            item.classificationPlace ??
            null,
          // extras
          level_name: item.level_name ?? item.levelName ?? item.level ?? "",
          area_name: item.area_name ?? item.areaName ?? item.area ?? "",
        })).filter(item => item.classification_place !== null);

        // 3) Orden de medallas
        const medalOrder: Record<string, number> = {
          Oro: 1,
          Plata: 2,
          Bronce: 3,
          "Mención de Honor": 4,
        };

        // 4) Orden final
        const sorted = [...normalized].sort((a, b) => {
          const lvlA = levelOrder[a.level_name] ?? 999;
          const lvlB = levelOrder[b.level_name] ?? 999;

          if (lvlA !== lvlB) return lvlA - lvlB;

          const mA = medalOrder[a.classification_place ?? ""] ?? 99;
          const mB = medalOrder[b.classification_place ?? ""] ?? 99;

          return mA - mB;
        });

        setRows(sorted);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
    
  }, [idOlympiad, idArea]);


  const getColorByMedal = (
    place: AwardWinningCompetitors["classification_place"] | null
  ) => {
    if (!place) return "neutral";
    switch (place) {
      case "Oro":
        return "success";
      case "Plata":
        return "info";
      case "Bronce":
        return "warning";
      case "Mención de Honor":
        return "neutral";
      default:
        return "neutral";
    }
  };

  // Filtro final
  const filteredRows = rows.filter((r) => {
    const byNivel =
      filterNivel.length === 0 ||
      filterNivel.includes(r.level_name.toLowerCase());

    const byDep =
      filterDepartamento.length === 0 ||
      filterDepartamento.includes(r.department.toLowerCase());

    return byNivel && byDep;
  });
  
  if (loading) return <p>Cargando datos…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const formatRows = () => {
    return filteredRows.map((c) => ({
        Nombre: c.first_name,
        Apellido: c.last_name,
        Colegio: c.school_name,
        Departamento: c.department,
        Área: c.area_name,
        Nivel: c.level_name,
        Puesto: c.classification_place,
    }));
  };

  //  DESCARGAR PDF
  const handleDownloadPDF = () => {
    const rows = formatRows();
    if (!rows.length) return;

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(14);
    doc.text("Podio de Ganadores", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [Object.keys(rows[0])],
      body: rows.map((r) => Object.values(r)),
      styles: { halign: "center", valign: "middle" },
      headStyles: { fillColor: [23, 86, 166] },
    });

    doc.save("podio_ganadores.pdf");
  };


  // DESCARGAR CSV
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
    link.download = "podio_ganadores.csv";
    link.click();
  };


  // DESCARGAR EXCEL
  const handleDownloadExcel = () => {
    const rows = formatRows();
    if (!rows.length) return;

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ganadores");

    XLSX.writeFile(workbook, "podio_ganadores.xlsx");
  };

  return (
    <div className="mx-auto w-full space-y-4">
      <h2 className="block text-left text-lg font-semibold mb-3">
        Podio de Competidores
      </h2>

      {/* Filtros */}
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
          label="Departamento"
          options={[
            { label: "La Paz", value: "la paz" },
            { label: "Cochabamba", value: "cochabamba" },
            { label: "Santa Cruz", value: "santa cruz" },
            { label: "Potosí", value: "potosí" },
            { label: "Chuquisaca", value: "chuquisaca" },
            { label: "Tarija", value: "tarija" },
            { label: "Oruro", value: "oruro" },
            { label: "Beni", value: "beni" },
            { label: "Pando", value: "pando" },
          ]}
          selectedValues={filterDepartamento}
          onChange={setFilterDepartamento}
        />

        <ClearFiltersButton
          onClick={() => {
            setFilterNivel([]);
            setFilterDepartamento([]);
          }}
        />
      </div>

      {/* Tabla */}
      <div className="mt-6 overflow-x-auto rounded-xl">
        <Table className="min-w-full border border-gray-200 rounded-xl text-sm text-center">
          <TableHeader className="bg-gray-100 border-b border-border bg-muted/50">
            <TableRow>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Nombre</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Apellido</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Unida Educativa</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Departamento</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Área</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Nivel</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Lugar</th>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-3 text-gray-500">
                  No hay ganadores registrados con estos filtros.
                </td>
              </tr>
            ) : (
              filteredRows.map((c, i) => (
                <TableRow key={i} className="hover:bg-gray-50 border-b border-border last:border-0">
                  <td className="px-5 py-4 text-sm">{c.first_name}</td>
                  <td className="px-5 py-4 text-sm">{c.last_name}</td>
                  <td className="px-5 py-4 text-sm">{c.school_name}</td>
                  <td className="px-5 py-4 text-sm">{c.department}</td>
                  <td className="px-5 py-4 text-sm">{c.area_name}</td>
                  <td className="px-5 py-4 text-sm">{c.level_name}</td>
                  <td className="px-5 py-4 text-sm whitespace-nowrap text-center">
                    <Badge color={getColorByMedal(c.classification_place)}>
                      {c.classification_place ?? "Sin clasificación"}
                    </Badge>
                  </td>
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
