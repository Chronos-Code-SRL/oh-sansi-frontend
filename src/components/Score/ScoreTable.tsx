import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import { getContestantByPhaseOlympiadAreaLevel } from "../../api/services/contestantService";
import { Contestant } from "../../types/Contestant";

interface ScoreTableProps {
  olympiadId: number;
  areaId: number;
  levelId: number;
  phaseId?: number;
  scoreCut: number;
}

export default function ScoreTable({
  olympiadId,
  areaId,
  levelId,
  phaseId,
  scoreCut,
}: ScoreTableProps) {
  const [students, setStudents] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!levelId || !phaseId) return; 
    let alive = true;

    async function loadContestants() {
      setLoading(true);
      setError(null);
      setStudents([]);

      try {
        const data = await getContestantByPhaseOlympiadAreaLevel(
          Number(phaseId),
          olympiadId,
          areaId,
          levelId
        );

        const list = Array.isArray(data) ? data : [];
        if (alive) setStudents(list);
      } catch (err: any) {
        if (alive) {
          const message =
            err?.response?.status === 404
              ? "No hay competidores para este nivel."
              : "Error al cargar competidores.";
          setError(message);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadContestants();
    return () => {
      alive = false;
    };
  }, [olympiadId, areaId, levelId, phaseId]);

  const processedStudents = useMemo(() => {
    const sorted = [...students].sort((a, b) => {
      const scoreA = typeof a.score === "number" ? a.score : -1;
      const scoreB = typeof b.score === "number" ? b.score : -1;
      return scoreB - scoreA;
    });

    return sorted.map((s) => ({
      ...s,
      isClassified: typeof s.score === "number" && s.score >= scoreCut,
    }));
  }, [students, scoreCut]);

  if (loading)
    return <p className="text-gray-600 text-sm px-4">Cargando competidores...</p>;
  if (error)
    return <p className="text-red-600 text-sm px-4">{error}</p>;
  if (students.length === 0)
    return <p className="text-gray-500 text-sm px-4">No hay competidores registrados.</p>;

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <Table className="rounded-xl">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Nombre</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Apellido</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">CI</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Nivel</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Grado</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Nota</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Clasificación</th>
          </TableRow>
        </TableHeader>

        <TableBody>
          {processedStudents.map((s) => (
            <TableRow
              key={s.contestant_id}
              className={`border-b border-border last:border-0 transition-colors hover:bg-gray-50 ${
                s.isClassified
                  ? "bg-emerald-50 dark:bg-emerald-950/20"
                  : typeof s.score === "number"
                  ? "bg-rose-50 dark:bg-rose-950/20"
                  : "bg-gray-50 dark:bg-gray-900/30"
              }`}
            >
              <td className="px-6 py-4 text-sm text-center">{s.first_name}</td>
              <td className="px-6 py-4 text-sm text-center">{s.last_name}</td>
              <td className="px-6 py-4 text-sm text-center">{s.ci_document}</td>
              <td className="px-6 py-4 text-sm text-center">{s.level_name}</td>
              <td className="px-6 py-4 text-sm text-center">{s.grade_name}</td>

              <td className="px-6 py-4 text-sm text-center">
                {typeof s.score === "number" ? s.score : "—"}
              </td>

              <td className="px-6 py-4 text-sm text-center">
                {typeof s.score === "number" ? (
                  s.isClassified ? (
                    <span className="inline-flex rounded-full px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium">
                      Clasificado
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full px-3 py-1 bg-rose-100 text-rose-700 text-xs font-medium">
                      No clasificado
                    </span>
                  )
                ) : (
                  <span className="text-gray-500 italic">Sin nota</span>
                )}
              </td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
