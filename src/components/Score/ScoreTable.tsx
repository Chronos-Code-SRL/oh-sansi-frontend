import { useEffect, useState, useMemo } from "react";
import Badge from "../ui/badge/Badge";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import { getContestantByPhaseOlympiadArea } from "../../api/services/contestantService";
import { Contestant } from "../../types/Contestant";

interface ScoreTableProps {
  olympiadId: number;
  areaId: number;
  phaseId?: number;
  scoreCut: number;
}

export default function ScoreTable({ olympiadId, areaId, phaseId = 1, scoreCut }: ScoreTableProps) {
  const [students, setStudents] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadContestants() {
      try {
        const data = await getContestantByPhaseOlympiadArea(phaseId, olympiadId, areaId);
        if (alive) setStudents(data);
      } catch (err: any) {
        if (alive) {
          const message =
            err?.response?.status === 404
              ? "No hay competidores para esta fase o área."
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
  }, [olympiadId, areaId, phaseId]);

  const processedStudents = useMemo(() => {
    return students.map((s) => ({
      ...s,
      isClassified: typeof s.score === "number" && s.score >= scoreCut,
    }));
  }, [students, scoreCut]);

  if (loading) {
    return <p className="text-gray-600 text-sm px-4">Cargando competidores...</p>;
  }

  if (error) {
    return <p className="text-red-600 text-sm px-4">{error}</p>;
  }

  if (students.length === 0) {
    return <p className="text-gray-500 text-sm px-4">No hay competidores registrados.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="px-6 py-3 border-b border-gray-100 text-sm text-gray-700">
        <span className="font-medium">Umbral actual:</span> {scoreCut}
      </div>

      <div className="max-w-full overflow-x-auto"></div>
      <Table>
        <TableHeader className="border-b border-border bg-muted/50">
          <TableRow>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nombre</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Apellido</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">CI</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nivel</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Grado</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Estado</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nota</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Clasificación</th>
          </TableRow>
        </TableHeader>

        <TableBody>
          {processedStudents.map((s) => (
            <TableRow
              key={s.contestant_id}
              className={`border-b border-border last:border-0 transition-colors ${
                s.isClassified
                  ? "bg-green-50 dark:bg-green-950/20"
                  : "bg-red-50 dark:bg-red-950/20"
              }`}
            >
              <td className="px-6 py-4 text-sm">{s.first_name}</td>
              <td className="px-6 py-4 text-sm">{s.last_name}</td>
              <td className="px-6 py-4 text-sm">{s.ci_document}</td>
              <td className="px-6 py-4 text-sm">{s.level_name}</td>
              <td className="px-6 py-4 text-sm">{s.grade_name}</td>
              <td className="px-6 py-4 text-sm">
                <Badge color={s.status ? "success" : "error"}>
                  {s.status ? "Evaluado" : "No Evaluado"}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                {typeof s.score === "number" ? s.score : "—"}
              </td>
              <td className="px-6 py-4 text-sm">
                {typeof s.score === "number" ? (
                  s.isClassified ? (
                    <Badge color="success">Clasificado</Badge>
                  ) : (
                    <Badge color="error">No clasificado</Badge>
                  )
                ) : (
                  <span className="text-gray-400 italic">Sin nota</span>
                )}
              </td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
