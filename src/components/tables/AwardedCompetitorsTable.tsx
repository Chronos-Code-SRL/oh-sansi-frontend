import { useEffect, useState } from "react";
import { Area } from "../../types/Area";
import { Level } from "../../types/Level";
import { getAreasFromUserOlympiads } from "../../api/services/olympiadService";
import { getLevelsByOlympiadAndArea } from "../../api/services/levelGradesService";
import { getAwardWinningCompetitorsArea } from "../../api/services/contestantService";
import { AwardWinningCompetitorsByArea } from "../../types/Contestant";
import Select from "../form/Select";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";

export default function AwardedContestantsTable() {
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

            const data = await getAwardWinningCompetitorsArea(
                olympiadId,
                areaId,
                levelId
            );

            console.log("Awarded Students Data:", data);

            if (alive) setStudents(data);
        } catch (err) {
            if (!alive) return;
            console.error(err);
            setStudents([]);
            setError("No se pudieron cargar los estudiantes premiados.");
        } finally {
            if (alive) setLoading(false);
        }
    }

    fetchAwardedStudents();

    return () => {
        alive = false;
    };
}, [selectedAreaId, selectedLevelId, selectedOlympiad?.id]);



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
                      <TableHeader className="bg-gray-100 border-b">
                          <TableRow>
                              <th className="px-4 py-3 text-center font-semibold">Nombre</th>
                              <th className="px-4 py-3 text-center font-semibold">Apellido</th>
                              <th className="px-4 py-3 text-center font-semibold">Unidad Educativa</th>
                              <th className="px-4 py-3 text-center font-semibold">Área</th>
                              <th className="px-4 py-3 text-center font-semibold">Nivel</th>
                              <th className="px-4 py-3 text-center font-semibold">Departamento</th>
                              <th className="px-4 py-3 text-center font-semibold">Medalla</th>
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
                                      No existen estudiantes premiados para el nivel seleccionado.
                                  </td>
                              </TableRow>
                          )}

                          {!loading && !error &&
                              students.map((s, index) => (
                                  <TableRow
                                      key={`${s.first_name}-${s.last_name}-${index}`}
                                      className="border-b last:border-0"
                                  >
                                      <td className="px-4 py-3 text-center">{s.first_name}</td>
                                      <td className="px-4 py-3 text-center">{s.last_name}</td>
                                      <td className="px-4 py-3 text-center">{s.school_name}</td>
                                      <td className="px-4 py-3 text-center">{s.area_name}</td>
                                      <td className="px-4 py-3 text-center">{s.level_name}</td>
                                      <td className="px-4 py-3 text-center">{s.department}</td>
                                      <td className="px-4 py-3 text-center font-semibold">
                                          {s.classification_place ?? "—"}
                                      </td>
                                  </TableRow>
                              ))}
                      </TableBody>
                  </Table>
              </div>
          ) : (
              <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
                  Seleccione un área y un nivel para visualizar los estudiantes premiados.
              </div>
          )}
      </>
  );

}



// interface Props {
//   idOlympiad: number;
//   idArea: number;
// }

// type AwardedRow = AwardWinningCompetitors & {
//   level_name: string;
//   area_name: string;
// };

// export default function AwardedTable({ idOlympiad, idArea }: Props) {
//   const [rows, setRows] = useState<AwardedRow[]>([]);
//   const [levels, setLevels] = useState<{ name: string }[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [filterNivel, setFilterNivel] = useState<string[]>([]);
//   const [filterDepartamento, setFilterDepartamento] = useState<string[]>([]);

//   useEffect(() => {
//     async function loadData() {
//       try {
//         setLoading(true);
//         setError(null);

//         if (!idOlympiad || !idArea) return;

//         const [levelsData, data] = await Promise.all([
//           getLevelsByOlympiadAndArea(idOlympiad, idArea),
//           getAwardWinningCompetitors(idOlympiad, idArea),
//         ]);

//         setLevels(levelsData);

//         const levelOrder = levelsData.reduce((acc, level, index) => {
//           acc[level.name] = index + 1;
//           return acc;
//         }, {} as Record<string, number>);

//         const normalized: AwardedRow[] = data.map((item: any) => ({
//           contestant_id: item.contestant_id,
//           first_name: item.first_name ?? item.firstName ?? "",
//           last_name: item.last_name ?? item.lastName ?? "",
//           ci_document: item.ci_document ?? "",
//           school_name: item.school_name ?? "",
//           department: item.department ?? item.depto ?? "",
//           classification_place:
//             item.classification_place ??
//             item.classificationPlace ??
//             null,
//           level_name: item.level_name ?? item.levelName ?? item.level ?? "",
//           area_name: item.area_name ?? item.areaName ?? item.area ?? "",
//         })).filter(item => item.classification_place !== null);

//         const medalOrder: Record<string, number> = {
//           Oro: 1,
//           Plata: 2,
//           Bronce: 3,
//           "Mención de Honor": 4,
//         };

//         const sorted = [...normalized].sort((a, b) => {
//           const lvlA = levelOrder[a.level_name] ?? 999;
//           const lvlB = levelOrder[b.level_name] ?? 999;

//           if (lvlA !== lvlB) return lvlA - lvlB;

//           const mA = medalOrder[a.classification_place ?? ""] ?? 99;
//           const mB = medalOrder[b.classification_place ?? ""] ?? 99;

//           return mA - mB;
//         });

//         setRows(sorted);
//       } catch (err) {
//         setError("No se avalaron todos los niveles de esta área. Asegúrese de avalar todos los niveles.");
//         setRows([]);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadData();

//   }, [idOlympiad, idArea]);


//   const getColorByMedal = (
//     place: AwardWinningCompetitors["classification_place"] | null
//   ) => {
//     if (!place) return "neutral";
//     switch (place) {
//       case "Oro":
//         return "success";
//       case "Plata":
//         return "info";
//       case "Bronce":
//         return "warning";
//       case "Mención de Honor":
//         return "neutral";
//       default:
//         return "neutral";
//     }
//   };

//   // Filtro final
//   const filteredRows = rows.filter((r) => {
//     const byNivel =
//       filterNivel.length === 0 ||
//       filterNivel.includes(r.level_name.toLowerCase());

//     const byDep =
//       filterDepartamento.length === 0 ||
//       filterDepartamento.includes(r.department.toLowerCase());

//     return byNivel && byDep;
//   });

//   if (loading) return <p>Cargando datos…</p>;
//   if (error) return <p className="text-red-600">{error}</p>;

//   const formatRows = () => {
//     return filteredRows.map((c) => ({
//       Nombre: c.first_name,
//       Apellido: c.last_name,
//       Colegio: c.school_name,
//       Departamento: c.department,
//       Área: c.area_name,
//       Nivel: c.level_name,
//       Puesto: c.classification_place,
//     }));
//   };

//   const handleDownloadPDF = () => {
//     const rows = formatRows();
//     if (!rows.length) return;

//     const doc = new jsPDF({ orientation: "landscape" });

//     doc.setFontSize(14);
//     doc.text("Podio de Ganadores", 14, 15);

//     autoTable(doc, {
//       startY: 20,
//       head: [Object.keys(rows[0])],
//       body: rows.map((r) => Object.values(r)),
//       styles: { halign: "center", valign: "middle" },
//       headStyles: { fillColor: [23, 86, 166] },
//     });

//     doc.save("podio_ganadores.pdf");
//   };


//   const handleDownloadCSV = () => {
//     const rows = formatRows();
//     if (!rows.length) return;

//     const headers = Object.keys(rows[0]).join(",");

//     const body = rows
//       .map((r) =>
//         Object.values(r)
//           .map((v) => `"${String(v).replace(/"/g, '""')}"`)
//           .join(",")
//       )
//       .join("\n");

//     const csv = `${headers}\n${body}`;
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);

//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "podio_ganadores.csv";
//     link.click();
//   };


//   const handleDownloadExcel = () => {
//     const rows = formatRows();
//     if (!rows.length) return;

//     const worksheet = XLSX.utils.json_to_sheet(rows);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Ganadores");

//     XLSX.writeFile(workbook, "podio_ganadores.xlsx");
//   };

//   return (
//     <div className="mx-auto w-full space-y-4">
//       <h2 className="block text-left text-lg font-semibold mb-3">
//         Podio de Competidores
//       </h2>

//       <div className="flex flex-wrap items-center gap-4 mb-4">
//         <h1>Filtrar por:</h1>
//         <FilterDropdown
//           label="Nivel"
//           options={levels.map((lvl) => ({
//             label: lvl.name,
//             value: lvl.name.toLowerCase(),
//           }))}
//           selectedValues={filterNivel}
//           onChange={setFilterNivel}
//         />

//         <FilterDropdown
//           label="Departamento"
//           options={[
//             { label: "La Paz", value: "la paz" },
//             { label: "Cochabamba", value: "cochabamba" },
//             { label: "Santa Cruz", value: "santa cruz" },
//             { label: "Potosí", value: "potosí" },
//             { label: "Chuquisaca", value: "chuquisaca" },
//             { label: "Tarija", value: "tarija" },
//             { label: "Oruro", value: "oruro" },
//             { label: "Beni", value: "beni" },
//             { label: "Pando", value: "pando" },
//           ]}
//           selectedValues={filterDepartamento}
//           onChange={setFilterDepartamento}
//         />

//         <ClearFiltersButton
//           onClick={() => {
//             setFilterNivel([]);
//             setFilterDepartamento([]);
//           }}
//         />
//       </div>

//       <div className="mt-6 overflow-x-auto rounded-xl">
//         <Table className="min-w-full border border-gray-200 rounded-xl text-sm text-center">
//           <TableHeader className="bg-gray-100 border-b border-border bg-muted/50">
//             <TableRow>
//               <th className="px-5 py-4 text-sm font-semibold text-foreground">Nombre</th>
//               <th className="px-5 py-4 text-sm font-semibold text-foreground">Apellido</th>
//               <th className="px-5 py-4 text-sm font-semibold text-foreground">Unida Educativa</th>
//               <th className="px-5 py-4 text-sm font-semibold text-foreground">Departamento</th>
//               <th className="px-5 py-4 text-sm font-semibold text-foreground">Área</th>
//               <th className="px-5 py-4 text-sm font-semibold text-foreground">Nivel</th>
//               <th className="px-5 py-4 text-sm font-semibold text-foreground">Lugar</th>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {filteredRows.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="text-center py-3 text-gray-500">
//                   No hay ganadores registrados con estos filtros.
//                 </td>
//               </tr>
//             ) : (
//               filteredRows.map((c, i) => (
//                 <TableRow key={i} className="hover:bg-gray-50 border-b border-border last:border-0">
//                   <td className="px-5 py-4 text-sm">{c.first_name}</td>
//                   <td className="px-5 py-4 text-sm">{c.last_name}</td>
//                   <td className="px-5 py-4 text-sm">{c.school_name}</td>
//                   <td className="px-5 py-4 text-sm">{c.department}</td>
//                   <td className="px-5 py-4 text-sm">{c.area_name}</td>
//                   <td className="px-5 py-4 text-sm">{c.level_name}</td>
//                   <td className="px-5 py-4 text-sm whitespace-nowrap text-center">
//                     <Badge color={getColorByMedal(c.classification_place)}>
//                       {c.classification_place ?? "Sin clasificación"}
//                     </Badge>
//                   </td>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//       <FloatingDownloadButton
//         hasData={filteredRows.length > 0}
//         onPDF={handleDownloadPDF}
//         onCSV={handleDownloadCSV}
//         onExcel={handleDownloadExcel}
//       />

//       <ScrollToTopButton />

//     </div>
//   );
// }
