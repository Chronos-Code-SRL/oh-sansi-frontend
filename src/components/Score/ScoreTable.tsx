import { useEffect, useState, useMemo, useRef } from "react";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import { getContestantByPhaseOlympiadAreaLevel, checkUpdates } from "../../api/services/contestantService";
import { Contestant, Evaluation } from "../../types/Contestant";
import Badge from "../ui/badge/Badge";
import BoxFinishedPhase from "../common/BoxFinishedPhase";
import { BoxFaseLevel } from "../common/BoxPhasesLevel";

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
  
  const lastUpdateAtRef = useRef<string | null>(null);
  const pollingRef = useRef<number | null>(null);


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

  // Polling en tiempo real para notas y estado de clasificación
  useEffect(() => {
    if (!levelId || !phaseId) return;

    async function pollOnce() {
      const since = lastUpdateAtRef.current ?? new Date().toISOString();
      try {
        const res = await checkUpdates(since);
        if (Array.isArray(res.new_evaluations) && res.new_evaluations.length > 0) {
          const byEvaluation = new Map<number, Evaluation>();
          for (const ev of res.new_evaluations as any[]) {
            const evalId = (typeof ev.evaluation_id === "number") ? ev.evaluation_id : (typeof ev.id === "number" ? ev.id : undefined);
            if (typeof evalId === "number") byEvaluation.set(evalId, ev);
          }

          setStudents(prev => prev.map(st => {
            const evalId = (st as any).evaluation_id as number | undefined;
            const ev = (typeof evalId === "number") ? byEvaluation.get(evalId) : undefined;
            if (!ev) return st;
            const nextScore = typeof ev.score === "number" ? ev.score : st.score;
            const hasClassStatus = Object.prototype.hasOwnProperty.call(ev as any, "classification_status");
            const hasClassPlace = Object.prototype.hasOwnProperty.call(ev as any, "classification_place");
            const nextClassStatus = hasClassStatus ? ((ev as any).classification_status ?? null) : (st as any).classification_status;
            const nextClassPlace = hasClassPlace ? ((ev as any).classification_place ?? null) : (st as any).classification_place;
            if (nextScore === st.score && nextClassStatus === (st as any).classification_status && nextClassPlace === (st as any).classification_place) return st;
            return { ...st, score: nextScore, classification_status: nextClassStatus, classification_place: nextClassPlace } as Contestant;
          }));
        }

        const serverLast = res?.last_updated_at ?? since;
        const t = new Date(serverLast);
        lastUpdateAtRef.current = new Date(t.getTime() - 1).toISOString();
      } catch (err) {
        // Silenciar errores de polling en esta vista
      }
    }

    lastUpdateAtRef.current = new Date().toISOString();
    pollingRef.current = window.setInterval(pollOnce, 3000);
    void pollOnce();
    const onFocus = () => { void pollOnce(); };
    const onVis = () => { if (!document.hidden) void pollOnce(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
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
      isClassified: s.classification_status === "clasificado" || (typeof s.score === "number" && s.score >= scoreCut),
    }));
  }, [students, scoreCut]);

  if (loading)
    return <p className="text-gray-600 text-sm px-4">Cargando competidores...</p>;
  if (error)
    return <p className="text-red-600 text-sm px-4">{error}</p>;
  if (students.length === 0)
    return <p className="text-gray-500 text-sm px-4">No hay competidores registrados.</p>;

  return (
    <>
      

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <Table className="rounded-xl">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Nombre</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Apellido</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">CI</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Nivel</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Grado</th>
              {/* <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Estado</th> */}
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Nota</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Clasificación</th>
            </TableRow>
          </TableHeader>

          <TableBody>
            {processedStudents.map((s) => (
              <TableRow
                key={s.contestant_id}
                className={`border-b border-border last:border-0 transition-colors hover:bg-gray-50 ${s.isClassified
                  // ? "bg-emerald-50 dark:bg-emerald-950/20"
                  // : typeof s.score === "number"
                  // ? "bg-rose-50 dark:bg-rose-950/20"
                  // : "bg-gray-50 dark:bg-gray-900/30"
                  }`}
              >
                <td className="px-6 py-4 text-sm text-center">{s.first_name}</td>
                <td className="px-6 py-4 text-sm text-center">{s.last_name}</td>
                <td className="px-6 py-4 text-sm text-center">{s.ci_document}</td>
                <td className="px-6 py-4 text-sm text-center">{s.level_name}</td>
                <td className="px-6 py-4 text-sm text-center">{s.grade_name}</td>

                {/* <td className="px-6 py-4 text-sm text-center">
                <span
                  className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
                    s.status
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {s.status ? "Evaluado" : "No Evaluado"}
                </span>
              </td> */}

                <td className="px-6 py-4 text-sm text-center">
                  {typeof s.score === "number" ? s.score :
                    <Badge color="neutral">-</Badge>}
                </td>

                {/* <td className="px-6 py-4 text-sm text-center">
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
              </td> */}

                <td className="px-6 py-4 text-sm text-center">
                  {s.classification_status === "clasificado" && (
                    <Badge color="success">Clasificado</Badge>
                  )}
                  {s.classification_status === "no_clasificado" && (
                    <Badge color="error">No clasificado</Badge>
                  )}
                  {s.classification_status === "descalificado" && (
                    <Badge color="warning">Desclasificado</Badge>
                  )}
                  {s.classification_status === null && (
                    <Badge color="neutral">-</Badge>
                  )}
                </td>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
