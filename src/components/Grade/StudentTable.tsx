import { useEffect, useRef, useState } from "react";
import Badge from "../ui/badge/Badge";
import { CheckLineIcon, CloseLineIcon, CommentIcon } from "../../icons";
import Alert from "../ui/alert/Alert";
import CommentModal from "./CommentModal";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import type { KeyboardEventHandler } from "react";
import { Contestant, Evaluation } from "../../types/Contestant";
import { checkUpdates, getContestantByPhaseOlympiadArea, updatePartialEvaluation } from "../../api/services/contestantService";
import SearchBar from "./Searcher";
import Filter from "./Filter";


export default function StudentTable() {
    const [students, setStudents] = useState<Contestant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // States for editing notes in time real
    const [editingCi, setEditingCi] = useState<string | null>(null);
    const [draftNote, setDraftNote] = useState<number | "">("");
    const [saving, setSaving] = useState(false);

    // Estado para el Alert
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle, setAlertTitle] = useState<string>("");
    const [alertMessage, setAlertMessage] = useState<string>("");

    // Estado del modal de comentario
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [commentDraft, setCommentDraft] = useState<string>("");
    const [commentSaving, setCommentSaving] = useState(false);
    const [commentStudent, setCommentStudent] = useState<Contestant | null>(null);

    const autoHideTimerRef = useRef<number | null>(null);

    // Polling refs
    const lastUpdateAtRef = useRef<string | null>(null);
    const pollingRef = useRef<number | null>(null);

    // Helper: obtener el id de evaluación (ajusta si tu Contestant ya lo trae tipado)
    const getEvaluationId = (s: Contestant): number | string => {
        // Preferir s.evaluation_id si existe en tu API; fallback a contestant_id
        return (s as any).evaluation_id ?? s.contestant_id;
    };

    function openCommentModal(student: Contestant): void {
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

        async function loadContestants() {
            try {
                const data = await getContestantByPhaseOlympiadArea(1, 1, 2);
                if (alive) setStudents(data);
                console.log("Estudiantes cargados:", data);
            } catch {
                if (alive) setError("No se pudo cargar la lista de estudiantes.");
            } finally {
                if (alive) setLoading(false);
            }
        }

        loadContestants();
        return () => { alive = false; };
    }, []);

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
                    console.debug("[poll] ids:", res.new_evaluations.map(ev => ({
                        id: (ev as any).id,
                        contestant_id: (ev as any).contestant_id
                    })));

                    // Construimos dos índices: por contestant_id y por evaluation_id
                    const byContestant = new Map<number, Evaluation>();
                    const byEvaluation = new Map<number, Evaluation>();
                    for (const ev of res.new_evaluations as any[]) {
                        if (typeof ev.contestant_id === "number") byContestant.set(ev.contestant_id, ev);
                        if (typeof ev.id === "number") byEvaluation.set(ev.id, ev);
                    }

                    setStudents((prev) =>
                        prev.map((st) => {
                            // No pisar si la fila está en edición en esta pestaña
                            if (editingCi === st.ci_document) return st;

                            const evalId = (st as any).evaluation_id as number | undefined;
                            const ev = byContestant.get(st.contestant_id) ??
                                (typeof evalId === "number" ? byEvaluation.get(evalId) : undefined);

                            if (!ev) return st;

                            return {
                                ...st,
                                score: ev.score ?? st.score,
                                status: typeof ev.status === "boolean" ? ev.status : st.status,
                                description: typeof ev.description === "string" ? ev.description : st.description,
                            };
                        }),
                    );
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

    // // Timer para autocerrar el Alert
    // const autoHideTimerRef = useRef<number | null>(null);

    function showAlert(title: string, message: string): void {
        // Limpia un timer previo si existiera
        if (autoHideTimerRef.current !== null) {
            window.clearTimeout(autoHideTimerRef.current);
            autoHideTimerRef.current = null;
        }
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertOpen(true);

        // Auto-cerrar a los 3 segundos (ajustable)
        autoHideTimerRef.current = window.setTimeout(() => {
            setAlertOpen(false);
            autoHideTimerRef.current = null;
        }, 3000);
    }

    const startEdit = (s: Contestant) => {

        if (saving === true) {
            return
        };

        // Si ya está Evaluado, muestra la alerta y no entres a edición
        if (s.status === true) {
            showAlert("Acción no permitida", `El estudiante ${s.first_name} ${s.last_name} ya está Evaluado.`);
            return;
        }

        setEditingCi(s.ci_document);
        if (typeof s.score === "number") {
            setDraftNote(s.score);
        } else {
            setDraftNote("");
        }
    };

    // const cancelEdit = () => {
    //     if (saving === true) {
    //         return;
    //     }
    //     setEditingCi(null);
    //     setDraftNote("");
    // };

    const saveNote = async (s: Contestant) => {
        if (saving) return;
        if (draftNote === "" || isNaN(Number(draftNote))) return;
        const nota = Math.max(0, Math.min(100, Number(draftNote)));

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
        } catch (e) {
            console.error("[saveNote] ERROR", e);
            setError("No se pudo guardar la nota.");
        } finally {
            setSaving(false);
        }
    };

    const rejectNote = async (s: Contestant) => {
        if (saving) return;
        try {
            setSaving(true);

            // Opción A: limpiar score (ojo: tu backend hoy setea status=true si 'score' existe, incluso si es null)
            // Idealmente el backend debería permitir poner status=false explícitamente.
            await updatePartialEvaluation(getEvaluationId(s), { score: null });

            setStudents((prev) =>
                prev.map((st) =>
                    st.contestant_id === s.contestant_id
                        ? { ...st, score: null as any, status: false }
                        : st,
                ),
            );
            setEditingCi(null);
        } catch {
            setError("No se pudo actualizar el estado.");
        } finally {
            setSaving(false);
        }
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
        // if (e.key === "Escape") {
        //     cancelEdit();
        // }
    };

    return (
        <>
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
                        {loading === false && error === null && filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No se encontraron resultados.
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
                                                    max={100}
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
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 justify-center"
                                                    title="Aceptar"
                                                >
                                                    <CheckLineIcon className="size-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={saving === true}
                                                    onClick={() => rejectNote(s)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 justify-center"
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
                                            onClick={() => openCommentModal(s)}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
                                            title={s.description && s.description.length > 0 ? "Ver/editar comentario" : "Agregar comentario"}
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

            {alertOpen && (
                <div
                    className="fixed bottom-6 right-6 z-[1000] w-[360px] max-w-[92vw] pointer-events-none"
                    role="presentation"
                >
                    <div className="pointer-events-auto" role="alert" aria-live="polite">
                        <Alert
                            variant="error"
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
            />
        </>
    )
}