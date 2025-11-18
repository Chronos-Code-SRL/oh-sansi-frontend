import { useEffect, useState } from "react";
import { getLevelsByOlympiadAndArea } from "../../api/services/levelGradesService";
import { getContestantsClassifieds } from "../../api/services/contestantService";
import { LevelOption } from "../../types/Level";
import { ConstestantRanked } from "../../types/Contestant";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";

interface Props {
  idPhase: number;
  idOlympiad: number;
  idArea: number;

}

export default function ClassifiedByLevelSimple({ idPhase, idOlympiad, idArea }: Props) {
  const [levels, setLevels] = useState<LevelOption[]>([]);
  const [groups, setGroups] = useState<{ level: LevelOption; data: ConstestantRanked[]; open: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);

  // 1) Cargar niveles del área → olympiadId + areaId
  useEffect(() => {
    async function loadLevels() {
      try {
        const lvl = await getLevelsByOlympiadAndArea(idOlympiad, idArea);
        console.log("📌 Niveles recibidos:", lvl)
        setLevels(lvl);
      } catch (err) {
        setError("No se pudieron cargar los niveles.");
      }
    }
    loadLevels();
  }, [idOlympiad, idArea]);

  // 2) Por cada nivel → traer concursantes clasificados
  useEffect(() => {
    if (levels.length === 0) return;

    async function loadContestants() {
      setLoading(true);
      try {
        const promises = levels.map(async (lvl) => {
          try {
            const data = await getContestantsClassifieds(idOlympiad, idArea, idPhase, lvl.id);
            return { level: lvl, data, open: true };
          } catch {
            return { level: lvl, data: [], open: true };
          }
        });

        const results = await Promise.all(promises);
        setGroups(results);

        const merged = results
          .flatMap(g =>
            g.data.map(c => ({
              ...c,
              levelId: g.level.id,
              levelName: g.level.name
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


  return (
    <div className="mx-auto w-full space-y-4 ">
      <h2 className="block text-left text-lg font-semibold mb-3">Concursantes por nivel</h2>
      <div className="mt-6 overflow-x-auto rounded-xl ">
        <Table className="min-w-full border border-gray-200 text-sm text-center">
          <TableHeader className="bg-gray-100 border-b border-border bg-muted/50 ">
            <TableRow>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Nombre</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Apellido</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">CI</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Nivel</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Estado</th>
              <th className="px-5 py-4 text-sm font-semibold text-foreground">Nota</th>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-3 text-gray-500">
                  No hay concursantes registrados.
                </td>
              </tr>
            ) : (
              rows.map((c, idx) => (
                <TableRow key={idx} className="hover:bg-gray-50 border-b border-border last:border-0">
                  <td className="px-5 py-4 text-sm">{c.first_name}</td>
                  <td className="px-5 py-4 text-sm">{c.last_name}</td>
                  <td className="px-5 py-4 text-sm">{c.ci_document}</td>
                  <td className="px-5 py-4 text-sm">{c.levelName}</td>
                  <td className="px-5 py-4 text-sm whitespace-nowrap text-center">
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

                  <td className="px-5 py-4 text-sm">{c.score ?? "—"}</td>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

}
