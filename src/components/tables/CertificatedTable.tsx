import { useEffect, useState } from "react";
import { Area } from "../../types/Area";
import { Level } from "../../types/Level";
import { getAreasFromUserOlympiads } from "../../api/services/olympiadService";
import { getLevelsByOlympiadAndArea } from "../../api/services/levelGradesService";
import { getAwardWinningCompetitorsArea, getLastPhaseStatus } from "../../api/services/contestantService";
import { AwardWinningCompetitorsByArea } from "../../types/Contestant";
import Select from "../form/Select";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import FloatingDownloadButton from "../filter/FloatingDownloadButton";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";

export default function CertificatedTable() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [_areasLoading, setAreasLoading] = useState(false);
    const [_areasError, setAreasError] = useState<string | null>(null);

    const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);

    const [levels, setLevels] = useState<Level[]>([]);
    const [_levelsLoading, setLevelsLoading] = useState(false);
    const [_levelsError, setLevelsError] = useState<string | null>(null);
    const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);

    const [students, setStudents] = useState<AwardWinningCompetitorsByArea[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    type SelectedOlympiad = {
        id: number;
        name: string;
        status: string;
    };

    const [selectedOlympiad, _setSelectedOlympiad] = useState<SelectedOlympiad | null>(() => {
        const stored = localStorage.getItem("selectedOlympiad");
        return stored ? (JSON.parse(stored) as SelectedOlympiad) : null;
    });

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                setAreasLoading(true);
                const data = await getAreasFromUserOlympiads();
                console.log("Fetched Areas:", data);
                setAreas(data);
                setAreasError(null);
            } catch {
                setAreasError("No hay Olimpiadas creadas. Cree una olimpiada por favor");
            } finally {
                setAreasLoading(false);
            }
        };
        fetchAreas();
    }, []);

    useEffect(() => {
        let alive = true;
        async function fetchLevels() {
            if (selectedAreaId == null) {
                if (alive) {
                    setLevels([]);
                    setLevelsError(null);
                    setLevelsLoading(false);
                }
                return;
            }
            setLevelsLoading(true);
            setLevelsError(null);
            try {
                const data = await getLevelsByOlympiadAndArea(selectedOlympiad?.id ?? 0, selectedAreaId);
                if (alive) setLevels(data as Level[]);
                console.log("Fetched Levels:", data);
            } catch {
                if (alive) setLevelsError("No se pudieron cargar los niveles.");
            } finally {
                if (alive) setLevelsLoading(false);
            }
        }
        fetchLevels();
        return () => { alive = false; };
    }, [selectedAreaId, selectedOlympiad?.id]);

    useEffect(() => {
        let alive = true;

        async function fetchAwardedStudents() {
            const olympiadId = selectedOlympiad?.id ?? 0;
            const areaId = selectedAreaId ?? 0;
            const levelId = selectedLevelId ?? 0;

            if (olympiadId === 0 || areaId === 0 || levelId === 0) {
                if (alive) {
                    setStudents([]);
                    setError(null);
                }
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // validar si la última fase está avalada
                try {
                    await getLastPhaseStatus(olympiadId, areaId, levelId);
                } catch (phaseErr: any) {
                    const status = phaseErr?.response?.status;

                    if (status === 403) {
                        if (alive) {
                            setStudents([]);
                            setError("La última fase de este nivel no ha sido avalada.");
                        }
                        return;
                    }

                    if (status === 404) {
                        if (alive) {
                            setStudents([]);
                            setError("No hay estudiantes para la generación de certificados en este nivel.");
                        }
                        return;
                    }

                    // Otros errores de validación
                    if (alive) {
                        setStudents([]);
                        setError("No se pudo cargar la lista para generar certificados.");
                    }
                    return;
                }

                const data = await getAwardWinningCompetitorsArea(
                    olympiadId,
                    areaId,
                    levelId
                );

                const MEDAL_ORDER: { [key: string]: number } = {
                    "Oro": 1,
                    "Plata": 2,
                    "Bronce": 3,
                    "Mención honorífica": 4,
                    "null": 99,
                };

                const ordered = [...data]
                    .filter(s => s.classification_place !== null) // solo premiados
                    .sort(
                        (a, b) =>
                        MEDAL_ORDER[String(a.classification_place)] -
                        MEDAL_ORDER[String(b.classification_place)]
                );

                if (!alive) return;

                if (!data.length) {
                    setStudents([]);
                    setError("No hay estudiantes para la generación de certificados en este nivel.");
                    return;
                }

                setStudents(ordered);

            } catch (err) {
                console.error(err);
                if (!alive) return;
                setStudents([]);
                setError("No se pudo cargar la lista para generar certificados.");
            } finally {
                if (alive) setLoading(false);
            }
        }

        fetchAwardedStudents();
        return () => { alive = false; };

    }, [selectedAreaId, selectedLevelId, selectedOlympiad?.id]);

    const getColorByMedal = (
    place: AwardWinningCompetitorsByArea["classification_place"] | null
  ) => {
    if (!place) return "neutral";
    switch (place) {
      case "Oro":
        return "success";
      case "Plata":
        return "info";
      case "Bronce":
        return "warning";
      case "Mención honorífica":
        return "purple";
      default:
        return "neutral";
    }
  };

  const formatAwardedRows = () => {
    return students.map((s) => ({
        Nombre: s.first_name,
        Apellido: s.last_name,
        "Unidad Educativa": s.school_name,
        Departamento: s.department,
        Área: s.area_name,
        Nivel: s.level_name,
        Puntaje: s.score ?? "—",
        Medalla: s.classification_place ?? "—",
        Tutor: s.tutor,
        "Responsable de Área": s.area_responsible,
    }));
  };

    const handleDownloadCSV = () => {
        const rows = formatAwardedRows();
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
        link.download = "estudiantes_para_generacion_de_certificados.csv";
        link.click();
    };

    const handleDownloadPDF = () => {
        const rows = formatAwardedRows();
        if (!rows.length) return;

        const doc = new jsPDF({ orientation: "landscape" });

        doc.setFontSize(14);
        doc.text("Estudiantes para Generación de Certificados", 14, 15);

        autoTable(doc, {
            startY: 20,
            head: [Object.keys(rows[0])],
            body: rows.map((r) => Object.values(r)),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [40, 40, 40] },
        });

        doc.save("estudiantes_para_generacion_de_certificados.pdf");
    };

    const handleDownloadExcel = () => {
        const rows = formatAwardedRows();
        if (!rows.length) return;

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Para Generación de Certificados");

        XLSX.writeFile(workbook, "estudiantes_para_generacion_de_certificados.xlsx");
    };

    return (
      <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 min-w-0">
                    <Select
                        placeholder="Seleccione un área"
                        options={areas.map(l => ({
                            value: String(l.id),
                            label: l.name || `Área ${l.id}`,
                        }))}
                        value={selectedAreaId == null ? "" : String(selectedAreaId)}
                        onChange={(value: string) => {
                            if (!value) {
                                setSelectedAreaId(null);
                                setSelectedLevelId(null);
                                return;
                            }
                            const num = Number(value);
                            if (!Number.isNaN(num)) {
                                setSelectedAreaId(num);
                                setSelectedLevelId(null);
                            }
                        }}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <Select
                        placeholder="Seleccione un nivel"
                        options={levels.map(l => ({
                            value: String(l.id),
                            label: l.name || `Nivel ${l.id}`,
                        }))}
                        value={selectedLevelId == null ? "" : String(selectedLevelId)}
                        onChange={(value: string) => {
                            if (!value) { setSelectedLevelId(null); return; }
                            const num = Number(value);
                            if (!Number.isNaN(num)) setSelectedLevelId(num);
                        }}
                        disabled={selectedAreaId === null}
                    />
                </div>
            </div>
          {/* TABLA SOLO CUANDO HAY ÁREA Y NIVEL SELECCIONADOS */}
          {selectedAreaId !== null && selectedLevelId !== null ? (
              <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
                  <Table className="min-w-full border border-gray-200 text-sm text-left">
                      <TableHeader className="bg-gray-100 border-b border-border bg-muted/50">
                          <TableRow>
                              <th className="px-4 py-3 text-sm text-center font-semibold">Nombre</th>
                              <th className="px-4 py-3 text-sm text-center font-semibold">Apellido</th>
                              <th className="px-4 py-3 text-sm text-center font-semibold">Unidad Educativa</th>
                              <th className="px-4 py-3 text-sm text-center font-semibold">Departamento</th>
                              <th className="px-4 py-3 text-sm text-center font-semibold">Área</th>
                              <th className="px-4 py-3 text-sm text-center font-semibold">Nivel</th>
                              <th className="px-4 py-3 text-sm text-center font-semibold">Puntaje</th>
                              <th className="px-2 py-3 text-sm text-center font-semibold">Medalla</th>
                              <th className="px-4 py-3 text-sm text-center font-semibold">Tutor</th>
                              <th className="px-4 py-3 text-sm text-center font-semibold">Responsable de Área</th>

                          </TableRow>
                      </TableHeader>

                      <TableBody>
                          {loading && (
                              <TableRow>
                                  <td colSpan={7} className="px-4 py-4 text-center">
                                      Cargando...
                                  </td>
                              </TableRow>
                          )}

                          {!loading && error && (
                              <TableRow>
                                  <td colSpan={7} className="px-4 py-4 text-center text-red-600">
                                      {error}
                                  </td>
                              </TableRow>
                          )}

                          {!loading && !error && students.length === 0 && (
                              <TableRow>
                                  <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                                      No existen estudiantes para generar certificados para el nivel seleccionado.
                                  </td>
                              </TableRow>
                          )}

                          {!loading && !error &&
                              students.map((s, index) => (
                                  <TableRow
                                      key={`${s.first_name}-${s.last_name}-${index}`}
                                      className="hover:bg-gray-50 border-b border-border last:border-0"
                                  >
                                      <td className="px-4 py-4 text-sm text-center">{s.first_name}</td>
                                      <td className="px-4 py-4 text-sm text-center">{s.last_name}</td>
                                      <td className="px-4 py-4 text-sm text-center">{s.school_name}</td>
                                      <td className="px-4 py-4 text-sm text-center">{s.department}</td>
                                      <td className="px-4 py-4 text-sm text-center">{s.area_name}</td>
                                      <td className="px-4 py-4 text-sm text-center">{s.level_name}</td>
                                      <td className="px-4 py-4 text-sm text-center">{s.score ?? "—"}</td>
                                      <td className="px-2 py-4 text-sm text-nowrap text-center">
                                        <Badge color={getColorByMedal(s.classification_place)}>
                                            {s.classification_place ?? "Sin clasificación"}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-4 text-sm text-center">{s.tutor}</td>
                                      <td className="px-4 py-4 text-sm text-center">{s.area_responsible}</td>
                                  </TableRow>
                              ))}
                      </TableBody>
                  </Table>
                  <FloatingDownloadButton
                          hasData={students.length > 0}
                          onPDF={handleDownloadPDF}
                          onCSV={handleDownloadCSV}
                          onExcel={handleDownloadExcel}
                        />
              </div>
              
          ) : (
              <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
                  Seleccione un área y un nivel para visualizar la lista para generacion de certificados.
              </div>
          )}
      </>
  );

}