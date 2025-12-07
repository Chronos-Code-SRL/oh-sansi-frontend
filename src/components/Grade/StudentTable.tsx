import { useEffect, useRef, useState } from "react";
import Badge from "../ui/badge/Badge";
import { CheckLineIcon, CloseLineIcon, CommentIcon } from "../../icons";
import Alert from "../ui/alert/Alert";
import CommentModal from "./CommentModal";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import type { KeyboardEventHandler } from "react";
import { Contestant, Evaluation } from "../../types/Contestant";
import { checkUpdates, updatePartialEvaluation, getContestantByPhaseOlympiadAreaLevel } from "../../api/services/contestantService";
import { getPhaseStatus } from "../../api/services/phaseService";
import SearchBar from "./Searcher";
import Filter from "./Filter";
import Select from "../form/Select";
import { getLevelsByOlympiadAndArea } from "../../api/services/levelGradesService";
import { LevelOption } from "../../types/Level";
import { getScoresByOlympiadAreaPhaseLevel } from "../../api/services/ScoreCutsService";
import { getOlympiadPhases } from "../../api/services/phaseService";
import { Score } from "../../types/ScoreCuts";
import BoxFinishedPhase from "../common/BoxFinishedPhase";
import { BoxFaseLevel } from "../common/BoxPhasesLevel";

interface Props {
    idPhase: number;
    idOlympiad: number;
    idArea: number;
}

export default function StudentTable({ idPhase, idOlympiad, idArea }: Props) {
    const [students, setStudents] = useState<Contestant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [phaseStatus, setPhaseStatus] = useState<"Activa" | "Terminada" | "Sin empezar" | null>(null);
    // const [phaseLoading, setPhaseLoading] = useState(false);
    // const [phaseError, setPhaseError] = useState<string | null>(null);


    // States for editing notes in time real
    const [editingCi, setEditingCi] = useState<string | null>(null);
    const [draftNote, setDraftNote] = useState<number | "">("");
    const [saving, setSaving] = useState(false);

    // Estado para el Alert
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle, setAlertTitle] = useState<string>("");
    const [alertMessage, setAlertMessage] = useState<string>("");
    const [alertVariant, setAlertVariant] = useState<"success" | "error">("success");
    // Estado del modal de comentario
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [commentDraft, setCommentDraft] = useState<string>("");
    const [commentSaving, setCommentSaving] = useState(false);
    const [commentStudent, setCommentStudent] = useState<Contestant | null>(null);

    const [levels, setLevels] = useState<LevelOption[]>([]);
    const [levelsLoading, setLevelsLoading] = useState(false);
    const [levelsError, setLevelsError] = useState<string | null>(null);

    const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
    const autoHideTimerRef = useRef<number | null>(null);

    const [currentMaxScore, setCurrentMaxScore] = useState<Score>();
    const [phases, setPhases] = useState<{ id: number; name: string; order: number }[]>([]);

    // Polling refs
    const lastUpdateAtRef = useRef<string | null>(null);
    const pollingRef = useRef<number | null>(null);
    const phaseStatusPollingRef = useRef<number | null>(null);
    const scorePollingRef = useRef<number | null>(null);

    // Helper: obtener el id de evaluación (ajusta si tu Contestant ya lo trae tipado)
    const getEvaluationId = (s: Contestant): number | string => {
        // Preferir s.evaluation_id si existe en tu API; fallback a contestant_id
        return (s as any).evaluation_id;
    };

    function openCommentModal(student: Contestant): void {
        // if (phaseStatus === "Terminada") {
        //     showAlert("No editable", "La fase está terminada. No se permiten cambios.", "error");
        //     return;
        // }
        setCommentStudent(student);
        setCommentDraft(typeof student.description === "string" ? student.description : "");
        setCommentModalOpen(true);
    }
    function closeCommentModal(): void {
        if (commentSaving === true) return;
        setCommentModalOpen(false);
        setCommentStudent(null);
        setCommentDraft("");
    }
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilters, setSelectedFilters] = useState({
        estado: [] as string[],
        nivel: [] as string[],
        grado: [] as string[],
    });

    // Helper para mapear boolean -> etiqueta usada por el filtro
    const statusLabel = (status: boolean) => (status ? "Evaluado" : "No Evaluado");

    useEffect(() => {
        let alive = true;
        async function fetchLevels() {
            setLevelsLoading(true);
            setLevelsError(null);
            try {
                const data = await getLevelsByOlympiadAndArea(idOlympiad, idArea);
                if (alive) setLevels(data);
            } catch {
                if (alive) setLevelsError("No se pudieron cargar los niveles.");
            } finally {
                if (alive) setLevelsLoading(false);
            }
        } fetchLevels();
        return () => { alive = false; };
    }, [idArea]);

    // Cargar fases para mostrar nombre de la fase anterior en el panel informativo
    useEffect(() => {
        let alive = true;
        async function loadPhases() {
            try {
                const data = await getOlympiadPhases(idOlympiad);
                if (alive && Array.isArray(data)) setPhases(data);
            } catch {
                // si falla, el panel usará un texto genérico
            }
        }
        loadPhases();
        return () => { alive = false; };
    }, [idOlympiad]);

    // Cargar estudiantes SOLO cuando haya nivel seleccionado
    useEffect(() => {
        if (selectedLevelId == null) {
            setStudents([]);
            setLoading(false);
            setError(null);
            return;
        }
        const levelId = selectedLevelId; // ahora TypeScript sabe que es number

        let alive = true;
        setLoading(true);
        setError(null);
        async function loadContestants() {
            try {
                console.log(idPhase, idOlympiad, idArea, levelId);
                const data = await getContestantByPhaseOlympiadAreaLevel(
                    idPhase,
                    idOlympiad,
                    idArea,
                    levelId,
                );
                if (alive) setStudents(data);
            } catch {
                if (alive) setError("No existen estudiantes para el nivel seleccionado.");
            } finally {
                if (alive) setLoading(false);
            }
        }
        loadContestants();
        return () => { alive = false; };
    }, [idPhase, idOlympiad, idArea, selectedLevelId]);

    // Polling en tiempo real para actualizar currentMaxScore
    useEffect(() => {
        if (selectedLevelId == null) {
            setCurrentMaxScore(undefined);
            return;
        }

        let alive = true;
        const levelId = selectedLevelId;

        async function loadScore() {
            try {
                const scoreData = await getScoresByOlympiadAreaPhaseLevel(idOlympiad, idArea, idPhase, levelId);
                if (alive) {
                    setCurrentMaxScore(scoreData);
                    console.debug("[scorePolling] updated:", scoreData);
                }
            } catch (err) {
                console.warn("[StudentTable] getScoresByOlympiadAreaPhaseLevel error", err);
            }
        }

        // Cargar score inicial
        void loadScore();

        // Iniciar polling cada 3 segundos
        scorePollingRef.current = window.setInterval(loadScore, 3000);
        console.log("[scorePolling] polling started (3000ms)");

        // Handler único para focus/visibility
        const handleFocusOrVisibility = () => {
            if (!document.hidden && alive) void loadScore();
        };

        window.addEventListener("focus", handleFocusOrVisibility);
        document.addEventListener("visibilitychange", handleFocusOrVisibility);

        return () => {
            alive = false;
            if (scorePollingRef.current) {
                window.clearInterval(scorePollingRef.current);
                scorePollingRef.current = null;
                console.log("[scorePolling] polling stopped");
            }
            window.removeEventListener("focus", handleFocusOrVisibility);
            document.removeEventListener("visibilitychange", handleFocusOrVisibility);
        };
    }, [selectedLevelId, idPhase, idOlympiad, idArea]);

    // Obtener estado de fase para el nivel seleccionado con polling en tiempo real
    useEffect(() => {
        let alive = true;
        async function loadPhaseStatus() {
            if (selectedLevelId == null) {
                if (alive) setPhaseStatus(null);
                return;
            }
            try {
                const res = await getPhaseStatus(idOlympiad, idArea, selectedLevelId, idPhase);
                if (!alive) return;
                const status = res?.phase_status?.status ?? null;
                setPhaseStatus(status as any);
                console.debug("[phaseStatus] updated:", status);
            } catch (err) {
                console.warn("[StudentTable] getPhaseStatus error", err);
                if (alive) setPhaseStatus(null);
            }
        }

        // Cargar estado inicial
        void loadPhaseStatus();

        // Iniciar polling cada 5 segundos (ajustable según necesidad)
        if (selectedLevelId != null) {
            phaseStatusPollingRef.current = window.setInterval(() => {
                void loadPhaseStatus();
            }, 5000);
            console.log("[phaseStatus] polling started (5000ms)");
        }
        // Actualizar cuando la ventana recupera el foco
        const onFocus = () => { if (selectedLevelId != null) void loadPhaseStatus(); };
        const onVis = () => { if (!document.hidden && selectedLevelId != null) void loadPhaseStatus(); };
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVis);

        return () => {
            alive = false;
            if (phaseStatusPollingRef.current) {
                window.clearInterval(phaseStatusPollingRef.current);
                phaseStatusPollingRef.current = null;
                console.log("[phaseStatus] polling stopped");
            }
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVis);
        };
    }, [selectedLevelId, idPhase, idOlympiad, idArea]);

    // Polling para actualizaciones en tiempo real
    useEffect(() => {
        async function pollOnce() {
            const since = lastUpdateAtRef.current ?? new Date().toISOString();
            console.log(since);

            try {
                console.debug("[poll] tick -> lastUpdateAt:", since);
                const res = await checkUpdates(since);
                console.debug("[poll] response:", {
                    newCount: res?.new_evaluations?.length ?? 0,
                    last_updated_at: res?.last_updated_at
                });

                if (Array.isArray(res.new_evaluations) && res.new_evaluations.length > 0) {
                    // IMPORTANTE: El endpoint de check-updates retorna evaluation_id (no id) para cada evaluación.
                    // Antes se intentaba indexar por ev.id (undefined) y se caía al match por contestant_id,
                    // provocando que cualquier actualización de un concursante en otra fase/área/nivel "pintara"
                    // la fila aquí de forma visual (y luego al refrescar desaparecía). Ahora sólo actualizamos
                    // filas cuyo evaluation_id coincide exactamente.
                    console.debug("[poll] evaluation_ids:", res.new_evaluations.map(ev => ({
                        evaluation_id: (ev as any).evaluation_id,
                        contestant_id: (ev as any).contestant_id
                    })));

                    // Índice únicamente por evaluation_id para evitar contaminación entre tablas.
                    const byEvaluation = new Map<number, Evaluation>();
                    for (const ev of res.new_evaluations as any[]) {
                        const evalId = typeof ev.evaluation_id === "number" ? ev.evaluation_id : (typeof ev.id === "number" ? ev.id : undefined);
                        if (typeof evalId === "number") byEvaluation.set(evalId, ev);
                    }

                    setStudents(prev => prev.map(st => {
                        // No tocar si se está editando en esta pestaña
                        if (editingCi === st.ci_document) return st;
                        const evalId = (st as any).evaluation_id as number | undefined;
                        if (typeof evalId !== "number") return st;
                        const ev = byEvaluation.get(evalId);
                        if (!ev) return st;
                        return {
                            ...st,
                            score: ev.score ?? st.score,
                            status: typeof ev.status === "boolean" ? ev.status : st.status,
                            description: typeof ev.description === "string" ? ev.description : st.description,
                        };
                    }));
                }

                // Cursor seguro
                const serverLast = res?.last_updated_at ?? since;
                const t = new Date(serverLast);
                const safe = new Date(t.getTime() - 1).toISOString();
                lastUpdateAtRef.current = safe;
                console.debug("[poll] next lastUpdateAt:", safe);
            } catch (err) {
                console.warn("[StudentTable] polling:error", err);
            }
        }

        if (!lastUpdateAtRef.current) lastUpdateAtRef.current = new Date().toISOString();

        // Iniciar intervalo
        pollingRef.current = window.setInterval(pollOnce, 3000);
        console.log("[poll] start (3000ms)");

        // Tick inmediato para no esperar al primer intervalo
        void pollOnce();

        // Cuando el tab recupera foco o vuelve a ser visible, disparamos un tick
        const onFocus = () => { void pollOnce(); };
        const onVis = () => { if (!document.hidden) void pollOnce(); };
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVis);

        return () => {
            if (pollingRef.current) {
                window.clearInterval(pollingRef.current);
                pollingRef.current = null;
                console.log("[poll] stopped");
            }
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVis);
        };
    }, [editingCi]);

    // Filtrado según el texto recibido
    const normalize = (text: string) =>
        text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filteredStudents = students.filter((s) => {
        const q = normalize(searchQuery);
        const matchesSearch =
            normalize(s.first_name).includes(q) ||
            normalize(s.last_name).includes(q) ||
            s.ci_document.toString().includes(q);

        const matchesEstado =
            selectedFilters.estado.length === 0 ||
            selectedFilters.estado.includes(statusLabel(s.status)); // <- mapear boolean a string

        const matchesNivel =
            selectedFilters.nivel.length === 0 ||
            selectedFilters.nivel.includes(s.level_name);

        const matchesGrado =
            selectedFilters.grado.length === 0 ||
            selectedFilters.grado.includes(s.grade_name);

        return matchesSearch && matchesEstado && matchesNivel && matchesGrado;
    });

    async function saveComment(): Promise<void> {
        if (commentStudent === null) return;
        if (phaseStatus === "Terminada") {
            showAlert("No editable", "La fase está terminada. No se permiten cambios.", "error");
            return;
        }
        const texto = commentDraft.trim();

        try {
            setCommentSaving(true);
            const id = getEvaluationId(commentStudent);
            console.log("[saveComment] PATCH", { id, description: texto });
            await updatePartialEvaluation(id, { description: texto });
            console.log("[saveComment] OK", { id });

            // Actualiza estado local
            setStudents((prev) =>
                prev.map((st) =>
                    st.ci_document === commentStudent.ci_document ? { ...st, description: texto } : st,
                ),
            );
            showAlert("Comentario guardado", "Se guardó la retroalimentación del estudiante.");
            closeCommentModal();
        } catch {
            showAlert("Error", "No se pudo guardar el comentario. Intenta nuevamente.");
        } finally {
            setCommentSaving(false);
        }
    }

    function showAlert(title: string, message: string, variant: "success" | "error" = "success"): void {
        // Limpia un timer previo si existiera
        if (autoHideTimerRef.current !== null) {
            window.clearTimeout(autoHideTimerRef.current);
            autoHideTimerRef.current = null;
        }
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVariant(variant);
        setAlertOpen(true);
        // Auto-cerrar a los 3 segundos (ajustable)
        autoHideTimerRef.current = window.setTimeout(() => {
            setAlertOpen(false);
            autoHideTimerRef.current = null;
        }, 4000);
    }

    const startEdit = (s: Contestant) => {
        if (saving === true) {
            return
        };
        if (phaseStatus === "Terminada") {
            showAlert("No editable", "La fase está terminada. No se permiten cambios.", "error");
            return;
        }
        // Permitir editar incluso si está Evaluado
        setEditingCi(s.ci_document);
        if (typeof s.score === "number") {
            setDraftNote(s.score);
        } else {
            setDraftNote("");
        }
    };

    const saveNote = async (s: Contestant) => {
        if (saving) return;
        if (phaseStatus === "Terminada") {
            showAlert("No editable", "La fase está terminada. No se permiten cambios.", "error");
            return;
        }
        if (draftNote === "" || isNaN(Number(draftNote))) {
            showAlert("Nota inválida", "Debe ingresar un número.");
            return;
        }
        const v = Number(draftNote);
        //const cap = currentMaxScore?.max_score !== null ? currentMaxScore?.max_score : 100;
        const cap = currentMaxScore?.max_score ?? 100;
        if (v < 0) {
            showAlert("Nota fuera de rango", `La calificación debe ser mayor o igual 0`, "error");
            return;
        }
        if (v > cap) {
            showAlert("Nota fuera de rango", `La calificación debe ser menor o igual a ${cap}`, "error");
            return;
        }
        const nota = Math.max(0, Math.min(cap, v));
        try {
            setSaving(true);
            const id = getEvaluationId(s);
            console.log("[saveNote] PATCH", { id, score: nota });
            await updatePartialEvaluation(id, { score: nota });
            console.log("[saveNote] OK", { id, score: nota });
            setStudents((prev) =>
                prev.map((st) =>
                    st.contestant_id === s.contestant_id
                        ? { ...st, score: nota, status: true }
                        : st,
                ),
            );
            setEditingCi(null);
            showAlert("Nota guardada", "La calificación se guardó correctamente.", "success");
        } catch (e) {
            console.error("[saveNote] ERROR", e);
            setError("No se pudo guardar la nota.");
            //showAlert("Error", "No se pudo guardar la nota. Intente nuevamente.");
        } finally {
            setSaving(false);
        }
    };

    const rejectNote = (_s: Contestant) => {
        if (saving) return;
        // Cancelar edición sin modificar nota ni estado
        setEditingCi(null);
        setDraftNote("");
    };


    // Limpia el timer del Alert al desmontar el componente
    useEffect(() => {
        return () => {
            if (autoHideTimerRef.current !== null) {
                window.clearTimeout(autoHideTimerRef.current);
                autoHideTimerRef.current = null;
            }
        };
    }, []);

    const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter") {
            const s = students.find((x) => x.ci_document === editingCi);
            if (s) void saveNote(s);
        }
    };


    return (
        <>
            {phaseStatus === "Terminada" && (
                <div className="mb-4">
                    <BoxFinishedPhase />
                </div>
            )}
            {phaseStatus === "Sin empezar" && (
                <div className="mb-4">
                    <BoxFaseLevel
                        title={"FASE NO INICIADA"}
                        message={"Esta fase aún no ha comenzado. Espera a que se habilite para este nivel."}
                    />
                </div>
            )}
            <div className="relative xl:w-118 mb-4">
                <Select
                    placeholder="Seleccione un nivel"
                    options={levels.map(l => ({
                        value: String(l.id),
                        label: l.name || `Nivel ${l.id}`
                    }))}
                    value={selectedLevelId == null ? "" : String(selectedLevelId)}
                    onChange={(value: string) => {
                        if (!value) {
                            setSelectedLevelId(null);
                            return;
                        }
                        const num = Number(value);
                        if (!Number.isNaN(num)) setSelectedLevelId(num);
                    }}
                />
                {levelsLoading && <p className="text-xs mt-1 text-black-700">Cargando niveles...</p>}
                {levelsError && <p className="text-xs mt-1 text-red-600">{levelsError}</p>}
            </div>
            {phaseStatus !== null && phaseStatus !== "Sin empezar" && (
                <div className="flex items-center mb-3">
                    <SearchBar
                        onSearch={setSearchQuery}
                        placeholder="Buscar por nombre, apellido o CI..."
                    />
                    <Filter
                        selectedFilters={selectedFilters}
                        setSelectedFilters={setSelectedFilters}
                    />
                </div>
            )}

            {phaseStatus !== null && phaseStatus !== "Sin empezar" && (
                <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto"></div>
                    <Table className="rounded-xl">
                        <TableHeader className="bg-gray-100 ">
                            <TableRow>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Nombre</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Apellido</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">CI</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Nivel</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Grado</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Estado</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Nota</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Descripción</th>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading === true && (
                                <TableRow>
                                    {/* <TableCell colSpan={8} className="px-6 py-4 text-sm text-foreground">Cargando...</TableCell> */}
                                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-foreground">Cargando...</td>
                                </TableRow>
                            )}
                            {error !== null && loading === false && (
                                <TableRow>
                                    {/* <TableCell colSpan={8} className="px-6 py-4 text-sm text-red-600">{error}</TableCell> */}
                                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-red-600">{error}</td>
                                </TableRow>
                            )}
                            {selectedLevelId === null && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Por favor, seleccione un nivel para ver los estudiantes.
                                    </td>
                                </tr>
                            )}
                            {!loading && !error && filteredStudents.map((s) => {
                                const isEditing = editingCi === s.ci_document;
                                return (
                                    <TableRow key={s.contestant_id} className="border-b border-border last:border-0">
                                        <td className="px-6 py-4 text-sm text-center">{s.first_name}</td>
                                        <td className="px-6 py-4 text-sm text-center">{s.last_name}</td>
                                        <td className="px-6 py-4 text-sm text-center">{s.ci_document}</td>
                                        <td className="px-6 py-4 text-sm text-center">{s.level_name}</td>
                                        <td className="px-6 py-4 text-sm text-center">{s.grade_name}</td>
                                        <td className="px-6 py-4 text-sm text-center">
                                            <Badge color={s.status === true ? "success" : "error"}>
                                                {s.status ? "Evaluado" : "No Evaluado"}
                                            </Badge>
                                        </td>

                                        {/* Nota */}
                                        <td className={`px-6 py-4 text-sm items-center justify-center ${isEditing === false && s.status !== true ? "cursor-text" : ""}`}
                                            onClick={() => {
                                                if (isEditing === false) {
                                                    startEdit(s);
                                                }
                                            }}
                                        >
                                            {isEditing === true ? (
                                                <div className="flex items-center gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={currentMaxScore?.max_score ?? 100}
                                                        step={1}
                                                        value={draftNote}
                                                        autoFocus
                                                        onKeyDown={onKeyDown}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setDraftNote(v === "" ? "" : Number(v));
                                                        }}
                                                        className="h-9 w-[70px] rounded-lg border border-gray-300 bg-transparent px-2 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 text-center "
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={saving === true || draftNote === "" || isNaN(Number(draftNote))}
                                                        onClick={() => saveNote(s)} //Aca en el end point patch
                                                        className="inline-flex h-9 w-9 items-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 justify-center"
                                                        title="Aceptar"
                                                    >
                                                        <CheckLineIcon className="size-5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={saving === true}
                                                        onClick={() => rejectNote(s)}
                                                        className="inline-flex h-9 w-9 items-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 justify-center"
                                                        title="Rechazar"
                                                    >
                                                        <CloseLineIcon className="size-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 justify-center">
                                                    <span>{typeof s.score === "number" ? s.score : "—"}</span>
                                                    {/* Solo permitir edición cuando no está evaluado */}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-center">
                                            <button
                                                type="button"
                                                // disabled={phaseStatus === "Terminada"}
                                                onClick={() => openCommentModal(s)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg 
                                                border border-gray-200 bg-gray-50 text-gray-700 
                                                hover:bg-gray-100"
                                                title={s.description && s.description.length > 0 ? "Ver comentario" : "Agregar comentario"}
                                            >
                                                <CommentIcon className={`size-4 ${s.description ? "text-black-500" : ""}`} />
                                            </button>
                                        </td>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                </div>
            )}
            {alertOpen && (
                <div
                    className="fixed bottom-6 right-6 z-[1000] w-[360px] max-w-[92vw] pointer-events-none"
                    role="presentation"
                >
                    <div className="pointer-events-auto" role="alert" aria-live="polite">
                        <Alert
                            variant={alertVariant}
                            title={alertTitle}
                            message={alertMessage}
                        />
                    </div>
                </div>
            )
            }
            {/* Modal de comentario */}
            <CommentModal
                open={commentModalOpen}
                student={commentStudent}
                draft={commentDraft}
                saving={commentSaving}
                onChangeDraft={setCommentDraft}
                onSave={() => void saveComment()}
                onClose={closeCommentModal}
                readOnly={phaseStatus === "Terminada"}
            />
        </>
    )
}
