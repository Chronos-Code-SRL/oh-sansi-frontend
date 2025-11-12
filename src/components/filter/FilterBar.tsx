import React, { useEffect, useState } from "react";
import { FilterDropdown } from "./FilterDropdown";
import { getContestantByFilters } from "../../api/services/contestantService";
import { FilterList } from "../../types/Contestant";
import { FilterDropdownNota } from "./FilterDropDownNota";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { getLevelsOlympiad } from "../../api/services/levelGradesService";
import { LevelOption } from "../../types/Level";
import { Clean, DownloadIcon } from "../../icons";

import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";
import Button from "../ui/button/Button";
import ScrollToTopButton from "../ui/button/ScrollToTopButton";
import FloatingDownloadButton from "./FloatingDownloadButton";

export const FilterBar: React.FC = () => {
  const [contestants, setContestants] = useState<FilterList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string[]>([]);
  const [selectedGrado, setSelectedGrado] = useState<string[]>([]);
  const [selectedNivel, setSelectedNivel] = useState<string[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<string[]>([]);
  const [notaRange, setNotaRange] = useState<{ min: number; max: number } | null>(null);

  //Niveles
  const [levels, setLevels] = useState<LevelOption[]>([]);

  const [showDownloadMenu, setShowDownloadMenu] = useState(false);


  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(14);
    doc.text("Reporte de Concursantes Filtrados", 14, 15);

    const tableData = filteredContestants.map((c) => [
      c.first_name,
      c.last_name,
      c.ci_document,
      c.gender,
      c.department,
      c.area_name,
      c.grade_name,
      c.level_name,
      c.score !== null ? c.score : "—",
      c.status ? "Evaluado" : "No Evaluado",
    ]);

    autoTable(doc, {
      startY: 20,
      head: [[
        "Nombre", "Apellido", "C.I", "Género", "Departamento",
        "Área", "Grado", "Nivel", "Nota", "Estado",
      ]],
      body: tableData,
      styles: { halign: "center", valign: "middle" },
      headStyles: { halign: "center", fillColor: [23, 86, 166] },
    });

    doc.save("reporte_concursantes_filtrados.pdf");
  };


  // 🔹 Llamada a la API
  useEffect(() => {
    const fetchContestants = async () => {
      try {
        setLoading(true);
        const data = await getContestantByFilters();
        setContestants(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los concursantes");
      } finally {
        setLoading(false);
      }
    };

    fetchContestants();
  }, []);

  // Llamada a la API de niveles
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const data = await getLevelsOlympiad();
        setLevels(data);
      } catch (err) {
        console.error("Error al cargar los niveles:", err);
      }
    };

    fetchLevels();
  }, []);

  // 🔹 Filtros en memoria
  const filteredContestants = contestants.filter((c) => {
    const byGender = selectedGender.length === 0 || selectedGender.includes(c.gender.toLowerCase());
    const byDep = selectedDepartamento.length === 0 || selectedDepartamento.includes(c.department.toLowerCase());
    const byArea = selectedArea.length === 0 || selectedArea.includes(c.area_name.toLowerCase());
    const byGrado = selectedGrado.length === 0 || selectedGrado.includes(c.grade_name.toLowerCase());
    const byNivel = selectedNivel.length === 0 || selectedNivel.includes(c.level_name.toLowerCase());
    const byEstado =
      selectedEstado.length === 0 ||
      selectedEstado.includes(c.status ? "evaluado" : "no evaluado");
    const byNota =
      !notaRange ||
      (c.score !== null && c.score >= notaRange.min && c.score <= notaRange.max);

    return byGender && byDep && byArea && byGrado && byNivel && byEstado && byNota;
  });

  // función para limpiar todos los filtros
  const handleClearFilters = () => {
    setSelectedGender([]);
    setSelectedDepartamento([]);
    setSelectedArea([]);
    setSelectedGrado([]);
    setSelectedNivel([]);
    setSelectedEstado([]);
    setNotaRange(null);
  };

  // 🔹 Controlador de notas
  const handleFilterNota = (min: number, max: number) => {
    setNotaRange({ min, max });
  };

  // 🔹 descargar en csv
  const handleDownloadCSV = () => {
    const headers = [
      "Nombre","Apellido","C.I","Género","Departamento",
      "Área","Grado","Nivel","Nota","Estado",
    ];

    const rows = filteredContestants.map(c => [
      c.first_name,
      c.last_name,
      c.ci_document,
      c.gender,
      c.department,
      c.area_name,
      c.grade_name,
      c.level_name,
      c.score !== null ? c.score : "",
      c.status ? "Evaluado" : "No Evaluado",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "reporte_concursantes_filtrados.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🔹 descargar en xlsx
  const handleDownloadExcel = () => {
    const data = filteredContestants.map(c => ({
      Nombre: c.first_name,
      Apellido: c.last_name,
      CI: c.ci_document,
      Género: c.gender,
      Departamento: c.department,
      Área: c.area_name,
      Grado: c.grade_name,
      Nivel: c.level_name,
      Nota: c.score !== null ? c.score : "",
      Estado: c.status ? "Evaluado" : "No Evaluado",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Concursantes");
    XLSX.writeFile(wb, "reporte_concursantes_filtrados.xlsx");
  };


  return (
    <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
      <div className="mx-auto w-full space-y-8">
        <p className="block text-left text-lg font-semibold mb-3">Filtrar por:</p>

        {/* Dropdowns de filtro */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Contenedor izquierdo (filtros) */}
          <div className="flex flex-wrap items-center ">
            <FilterDropdown
              label="Género"
              options={[
                { label: "Masculino", value: "m" },
                { label: "Femenino", value: "f" },
              ]}
              selectedValues={selectedGender}
              onChange={setSelectedGender}
            />

            <FilterDropdown
              label="Departamento"
              options={[
                { label: "La Paz", value: "la paz" },
                { label: "Cochabamba", value: "cochabamba" },
                { label: "Santa Cruz", value: "santa cruz" },
                { label: "Potosí", value: "potosi" },
                { label: "Chuquisaca", value: "chuquisaca" },
                { label: "Tarija", value: "tarija" },
                { label: "Oruro", value: "oruro" },
                { label: "Beni", value: "beni" },
                { label: "Pando", value: "pando" },
              ]}
              selectedValues={selectedDepartamento}
              onChange={setSelectedDepartamento}
            />

            <FilterDropdown
              label="Área"
              options={[
                { label: "Física", value: "física" },
                { label: "Química", value: "química" },
                { label: "Biología", value: "biología" },
                { label: "Matemática", value: "matemática" },
                { label: "Informática", value: "informática" },
                { label: "Astronomía", value: "astronomía" },
                { label: "Robótica", value: "robótica" },
                { label: "Astrofísica", value: "astrofísica" },
              ]}
              selectedValues={selectedArea}
              onChange={setSelectedArea}
            />

            <FilterDropdown
              label="Grado"
              options={[
                { label: "Primero de Primaria", value: "primero de primaria" },
                { label: "Segundo de Primaria", value: "segundo de primaria" },
                { label: "Tercero de Primaria", value: "tercero de primaria" },
                { label: "Cuarto de Primaria", value: "cuarto de primaria" },
                { label: "Quinto de Primaria", value: "quinto de primaria" },
                { label: "Sexto de Primaria", value: "sexto de primaria" },
                { label: "Primero de Secundaria", value: "primero de secundaria" },
                { label: "Segundo de Secundaria", value: "segundo de secundaria" },
                { label: "Tercero de Secundaria", value: "tercero de secundaria" },
                { label: "Cuarto de Secundaria", value: "cuarto de secundaria" },
                { label: "Quinto de Secundaria", value: "quinto de secundaria" },
                { label: "Sexto de Secundaria", value: "sexto de secundaria" },
              ]}
              selectedValues={selectedGrado}
              onChange={setSelectedGrado}
            />

            <FilterDropdown
              label="Nivel"
              options={levels.map((lvl) => ({
                label: lvl.name,
                value: lvl.name.toLowerCase(),
              }))}
              selectedValues={selectedNivel}
              onChange={setSelectedNivel}
            />

            <FilterDropdown
              label="Estado"
              options={[
                { label: "Evaluado", value: "evaluado" },
                { label: "No evaluado", value: "no evaluado" },
              ]}
              selectedValues={selectedEstado}
              onChange={setSelectedEstado}
            />

            <FilterDropdownNota onConfirm={handleFilterNota} />
          </div>

          {/* Botón limpiar filtros */}
          <button
            onClick={handleClearFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg transition flex items-center gap-2"
          >
            <Clean className="w-5 h-5" />
          </button>
        </div>

        {/* 🔹 Tabla de resultados */}
        <div className="mt-6 overflow-x-auto rounded-xl ">
          {loading ? (
            <p className="text-gray-500 text-center">Cargando datos...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : filteredContestants.length === 0 ? (
            <p className="text-gray-500 text-center">No se encontraron concursantes.</p>
          ) : (
            <Table className="min-w-full border border-gray-200 rounded-lg text-sm text-left">
              <TableHeader className="bg-gray-100 border-b border-border bg-muted/50 ">
                <TableRow className="">
                  <th className="px-5 py-4 text-center text-sm font-semibold text-foreground">Nombre</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-foreground">Apellido</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-foreground">C.I.</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-foreground">Género</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-foreground">Departamento</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-foreground">Área</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-foreground">Grado</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-foreground">Nivel</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-foreground">Nota</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-foreground">Estado</th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContestants.map((c) => (
                  <TableRow key={c.contestant_id} className="hover:bg-gray-50 border-b border-border last:border-0">
                    <td className="px-5 py-4 text-sm text-center">{c.first_name}</td>
                    <td className="px-5 py-4 text-sm text-center">{c.last_name}</td>
                    <td className="px-5 py-4 text-sm text-center">{c.ci_document}</td>
                    <td className="px-5 py-4 text-sm text-center">{c.gender}</td>
                    <td className="px-5 py-4 text-sm text-center">{c.department}</td>
                    <td className="px-5 py-4 text-sm text-center">{c.area_name}</td>
                    <td className="px-5 py-4 text-sm text-center">{c.grade_name}</td>
                    <td className="px-5 py-4 text-sm text-center">{c.level_name}</td>
                    <td className="px-5 py-4 text-sm text-center">
                      {c.score !== null ? c.score : "—"}
                    </td>
                    <td className="px-5 py-4 text-sm items-center whitespace-nowrap text-center">
                        <Badge color={c.status === true ? "success" : "error"}>
                             {c.status ? "Evaluado" : "No Evaluado"}
                        </Badge>
                    </td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        {/* Botón de descargar PDF y Scroll to Top */}

        <FloatingDownloadButton
          hasData={filteredContestants.length > 0}
          onPDF={handleDownloadPDF}
          onCSV={handleDownloadCSV}
          onExcel={handleDownloadExcel}
        />
      
        <ScrollToTopButton />
        
      </div>
    </div>
  );
};
