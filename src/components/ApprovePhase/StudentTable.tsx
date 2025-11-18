import { useEffect, useRef, useState } from "react";
import Badge from "../ui/badge/Badge";
import { CheckLineIcon, CloseLineIcon, MoreDotIcon } from "../../icons";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import { Contestant, Evaluation } from "../../types/Contestant";
import { updatePartialEvaluation, getContestantByPhaseOlympiadAreaLevel, checkUpdates, getContestantStats } from "../../api/services/contestantService";
import { updateClassification } from "../../api/services/classification";
import Select from "../form/Select";
import { getLevelsByOlympiadAndArea } from "../../api/services/levelGradesService";
import { LevelOption } from "../../types/Level";
import SearchBar from "../Grade/Searcher";
import Filter from "../Grade/Filter";
// Eliminado CommentModal: usamos DisqualifyModal para desclasificar con comentario
import Button from "../ui/button/Button";
// import Alert from "../ui/alert/Alert";
import DisqualifyModal from "./DisqualifyModal";
import Alert from "../ui/alert/Alert";
import { updatePhaseStatus } from "../../api/services/phaseService";
import { getPhaseStatus } from "../../api/services/phaseService";
import ApprovePhaseModal from "./ApprovePhaseModal";
import BoxFinishedPhase from "../common/BoxFinishedPhase";

interface Props {
    idPhase: number;
    idOlympiad: number;
    idArea: number;
}

export default function StudentTable({ idPhase, idOlympiad, idArea }: Props) {
    const [students, setStudents] = useState<Contestant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado del modal de comentario
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [commentDraft, setCommentDraft] = useState<string>("");
    const [commentSaving, setCommentSaving] = useState(false);
    const [commentStudent, setCommentStudent] = useState<Contestant | null>(null);
    
    // ---- Modal Avalar ----
    const [openApproveModal, setOpenApproveModal] = useState(false);
    const [savingApprove, setSavingApprove] = useState(false);
    const [approveDraft, setApproveDraft] = useState("");
    const [endorsed, setEndorsed] = useState(false);

    const [levels, setLevels] = useState<LevelOption[]>([]);
    const [levelsLoading, setLevelsLoading] = useState(false);
    const [levelsError, setLevelsError] = useState<string | null>(null);

    // Edición de nota
    const [editingCi, setEditingCi] = useState<string | null>(null);
    const [draftNote, setDraftNote] = useState<number | "">("");
    const [saving, setSaving] = useState(false);

    // Estado para el Alert
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle, setAlertTitle] = useState<string>("");
    const [alertMessage, setAlertMessage] = useState<string>("");


    // Polling refs
    const lastUpdateAtRef = useRef<string | null>(null);
    const pollingRef = useRef<number | null>(null);

    const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
    const autoHideTimerRef = useRef<number | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilters, setSelectedFilters] = useState({
        estado: [] as string[],
        grado: [] as string[],
    });

    const [stats, setStats] = useState({
        total: 0,
        classified: 0,
        no_classified: 0,
        disqualified: 0
    });

    // Estado de la fase para el nivel seleccionado
    const [phaseStatus, setPhaseStatus] = useState<"active" | "finished" | "not_started" | null>(null);

    // Reset aval (endorsed) al cambiar de nivel o fase
    useEffect(() => {
        setEndorsed(false);
    }, [selectedLevelId, idPhase]);

    // Helper para mapear boolean -> etiqueta usada por el filtro
    const statusLabel = (status: boolean) => (status ? "Evaluado" : "No Evaluado");
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

    // Cargar estudiantes SOLO cuando haya nivel seleccionado
    useEffect(() => {
        if (selectedLevelId == null) {
            setStudents([]);
            setLoading(false);
            setError(null);
            setPhaseStatus(null);
            return;
        }
        const levelId = selectedLevelId; // ahora TypeScript sabe que es number

        let alive = true;
        setLoading(true);
        setError(null);
        // Consultar estado de fase para el nivel seleccionado
        (async () => {
            try {
                const res = await getPhaseStatus(idOlympiad, idArea, levelId, idPhase);
                const raw = (res as any)?.data?.status?.toString()?.toLowerCase?.() ?? "";
                let mapped: "active" | "finished" | "not_started" = "active";
                if (/(finished|ended|finalizada|finalized|endorsed)/.test(raw)) mapped = "finished";
                else if (/(not_started|pending|inactive|no\s*iniciad[oa]|not started)/.test(raw)) mapped = "not_started";
                if (alive) setPhaseStatus(mapped);
            } catch (e) {
                // Si falla, no bloqueamos; asumimos activa por defecto
                if (alive) setPhaseStatus("active");
            }
        })();
        async function loadContestants() {
            try {
                const data = await getContestantByPhaseOlympiadAreaLevel(
                    idPhase,
                    idOlympiad,
                    idArea,
                    levelId,
                );
                if (alive) setStudents(data);
                const st = await getContestantStats(idOlympiad, idArea, idPhase, levelId);
                setStats(st);
            } catch {
                if (alive) setError("No existen estudiantes para el nivel seleccionado.");
            } finally {
                if (alive) setLoading(false);
            }
        }
        loadContestants();
        return () => { alive = false; };
    }, [idPhase, idOlympiad, idArea, selectedLevelId]);


    useEffect(() => {

        if (selectedLevelId == null) return;

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
                        id: (ev as any).id ?? (ev as any).evaluation_id,
                        contestant_id: (ev as any).contestant_id
                    })));

                    // Construimos dos índices: por contestant_id y por evaluation_id (id || evaluation_id)
                    const byContestant = new Map<number, Evaluation>();
                    const byEvaluation = new Map<number, Evaluation>();
                    for (const ev of res.new_evaluations as any[]) {
                        if (typeof ev.contestant_id === "number") byContestant.set(ev.contestant_id, ev);
                        const evalId = (typeof ev.id === "number") ? ev.id : (typeof ev.evaluation_id === "number" ? ev.evaluation_id : undefined);
                        if (typeof evalId === "number") byEvaluation.set(evalId as number, ev);
                    }

                    setStudents((prev) =>
                        prev.map((st) => {
                            // Evitar que el polling pise la fila que se está editando
                            if (editingCi === st.ci_document) return st;
                            const evalId = (st as any).evaluation_id as number | undefined;
                            const ev = byContestant.get(st.contestant_id) ??
                                (typeof evalId === "number" ? byEvaluation.get(evalId) : undefined);

                            if (!ev) return st;

                            // Actualizamos nota, estado, descripción y clasificación en tiempo real
                            const nextScore = typeof ev.score === "number" ? ev.score : st.score;
                            const nextStatus = typeof ev.status === "boolean" ? ev.status : st.status;
                            const hasDescription = Object.prototype.hasOwnProperty.call(ev as any, "description");
                            const nextDescription = hasDescription ? ((ev as any).description ?? null) : st.description;
                            const hasClassStatus = Object.prototype.hasOwnProperty.call(ev as any, "classification_status");
                            const hasClassPlace = Object.prototype.hasOwnProperty.call(ev as any, "classification_place");
                            const nextClassStatus = hasClassStatus ? ((ev as any).classification_status ?? null) : (st as any).classification_status;
                            const nextClassPlace = hasClassPlace ? ((ev as any).classification_place ?? null) : (st as any).classification_place;
                            if (
                                nextScore === st.score &&
                                nextStatus === st.status &&
                                nextDescription === st.description &&
                                nextClassStatus === (st as any).classification_status &&
                                nextClassPlace === (st as any).classification_place
                            ) return st;
                            return { ...st, score: nextScore, status: nextStatus, description: nextDescription, classification_status: nextClassStatus, classification_place: nextClassPlace };
                        }),
                    );
                }

                if (selectedLevelId != null) {
                    try {
                        const newStats = await getContestantStats(idOlympiad, idArea, idPhase, selectedLevelId);
                        setStats(newStats);
                    } catch (e) {
                        console.warn("No se pudieron actualizar las estadísticas", e);
                    }
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

        // Reiniciar cursor cuando cambian los filtros principales
        lastUpdateAtRef.current = new Date().toISOString();

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
    }, [idPhase, idOlympiad, idArea, selectedLevelId]);


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
            selectedFilters.estado.includes(statusLabel(s.status)); 

        const matchesGrado =
            selectedFilters.grado.length === 0 ||
            selectedFilters.grado.includes(s.grade_name);

        return matchesSearch && matchesEstado && matchesGrado;
    });
    async function saveComment(): Promise<void> {
        if (commentStudent === null) return;
        const texto = commentDraft.trim();

        try {
            setCommentSaving(true);
            const id = Number(getEvaluationId(commentStudent));
            // Cambia el estado a descalificado y guarda descripción
            await updateClassification(id, {
                classification_status: "descalificado",
                classification_place: null,
                description: texto,
            });

            // Actualiza estado local (classification_status y description)
            setStudents((prev) =>
                prev.map((st) =>
                    st.ci_document === commentStudent.ci_document
                        ? { ...st, classification_status: "descalificado", description: texto }
                        : st,
                ),
            );
            // Refrescar estadísticas
            if (selectedLevelId != null) {
                try {
                    const st = await getContestantStats(idOlympiad, idArea, idPhase, selectedLevelId);
                    setStats(st);
                } catch {
                    // ignore
                }
            }
            closeCommentModal();
        } catch {
            showAlert("Error", "No se pudo guardar el comentario ni estado. Intenta nuevamente.");
        } finally {
            setCommentSaving(false);
        }
    }

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

    // Guardar nota parcial
    async function saveNote(s: Contestant): Promise<void> {
        if (saving) return;
        if (draftNote === "" || isNaN(Number(draftNote))) return;
        const nota = Math.max(0, Math.min(100, Number(draftNote)));

        try {
            setSaving(true);
            const id = getEvaluationId(s);
            await updatePartialEvaluation(id, { score: nota });
            // Actualiza estado local (opcional: marcar status=true)
            setStudents((prev) =>
                prev.map((st) =>
                    st.contestant_id === s.contestant_id
                        ? { ...st, score: nota, status: true }
                        : st,
                ),
            );
            setEditingCi(null);
            setDraftNote("");

            // Refrescar estadísticas si hay nivel seleccionado
            if (selectedLevelId != null) {
                try {
                    const st = await getContestantStats(idOlympiad, idArea, idPhase, selectedLevelId);
                    setStats(st);
                } catch {
                    // ignorar
                }
            }
        } catch (e) {
            setError("No se pudo guardar la nota.");
        } finally {
            setSaving(false);
        }
    }

    // Avalar fase para el nivel seleccionado
    async function handleApproveSave(): Promise<void> {
        if (!selectedLevelId) return;
        setSavingApprove(true);
        try {
            await updatePhaseStatus(idOlympiad, idArea, selectedLevelId, idPhase);
            setEndorsed(true);
            setAlertTitle("Fase avalada");
            setAlertMessage("La fase fue avalada correctamente para el nivel seleccionado.");
            setAlertOpen(true);
            if (autoHideTimerRef.current) window.clearTimeout(autoHideTimerRef.current);
            autoHideTimerRef.current = window.setTimeout(() => setAlertOpen(false), 4000);
        } catch (e) {
            setError("No se pudo avalar la fase. Intenta nuevamente.");
        } finally {
            setSavingApprove(false);
            setOpenApproveModal(false);
        }
    }

    useEffect(() => {
        return () => {
            if (autoHideTimerRef.current !== null) {
                window.clearTimeout(autoHideTimerRef.current);
                autoHideTimerRef.current = null;
            }
        };
    }, []);

    return (
        <>
            {/* Avisos de estado de fase */}
            {phaseStatus === "finished" && (
                <div className="mb-4">
                    <BoxFinishedPhase />
                </div>
            )}
            {phaseStatus === "not_started" && (
                <div className="mb-4">
                    <Alert
                        variant="info"
                        title="FASE NO INICIADA"
                        message="Esta fase aún no ha empezado para el nivel seleccionado."
                    />
                </div>
            )}
            {phaseStatus !== "not_started" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Competidores */}
                <div className="p-4 rounded-xl shadow bg-white border">
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                        Total competidores
                    </p>
                    <p className="text-3xl font-bold mt-2">{stats.total}</p>
                </div>

                {/* Clasificados */}
                <div className="p-4 rounded-xl shadow bg-white border">
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                        Clasificados
                    </p>
                    <p className="text-3xl font-bold mt-2 text-green-600">
                        {stats.classified}
                    </p>
                </div>

                {/* No clasificados */}
                <div className="p-4 rounded-xl shadow bg-white border">
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                        No clasificados
                    </p>
                    <p className="text-3xl font-bold mt-2 text-red-600">
                        {stats.no_classified}
                    </p>
                </div>

                {/* Desclasificados */}
                <div className="p-4 rounded-xl shadow bg-white border">
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                        Desclasificados
                    </p>
                    <p className="text-3xl font-bold mt-2 text-yellow-600">
                        {stats.disqualified}
                    </p>
                </div>

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

            {phaseStatus !== "not_started" && (
            <div className="flex items-center mb-3">
                <div className="flex items-center flex-grow">
                    <SearchBar
                        onSearch={setSearchQuery}
                        placeholder="Buscar por nombre, apellido o CI..."
                    />
                    <Filter
                        selectedFilters={selectedFilters}
                        setSelectedFilters={setSelectedFilters}
                    />
                </div>
                <Button
                    type="button"
                    size="sm"
                    disabled={selectedLevelId == null || savingApprove || endorsed}
                    onClick={() => setOpenApproveModal(true)}
                    startIcon={<CheckLineIcon className="w-5 h-5" />}
                >
                    {endorsed ? "Fase Avalada" : "Avalar Fase"}
                </Button>

            </div>
            )}

            {/* {endorsed && (
                <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">
                    Esta fase ya fue avalada para el nivel seleccionado. No se permiten más modificaciones.
                </div>
            )} */}
            {phaseStatus !== "not_started" && (
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
                            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Acciones</th>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading === true && (
                            <TableRow>
                                <td colSpan={8} className="px-6 py-4 text-center text-sm text-foreground">Cargando...</td>
                            </TableRow>
                        )}
                        {error !== null && loading === false && (
                            <TableRow>
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
                                        {s.classification_status === "clasificado" && (
                                            <Badge color="success">Clasificado</Badge>
                                        )}
                                        {s.classification_status === "no_clasificado" && (
                                            <Badge color="error">No clasificado</Badge>
                                        )}
                                        {(s.classification_status === "descalificado" || s.classification_status === null) && (
                                            <Badge color="warning">Desclasificado</Badge>
                                        )}
                                    </td>

                                    <td
                                        className={`px-6 py-4 text-sm items-center justify-center ${isEditing ? "" : "cursor-text"}`}
                                        onClick={() => {
                                            if (endorsed) return; // Bloquear edición si avalado
                                            if (!isEditing) {
                                                // Permitir editar incluso si está Evaluado
                                                setEditingCi(s.ci_document);
                                                if (typeof s.score === "number") setDraftNote(s.score);
                                                else setDraftNote("");
                                            }
                                        }}
                                    >
                                        {isEditing ? (
                                            <div className="flex items-center gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    value={draftNote}
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") void saveNote(s);
                                                    }}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        setDraftNote(v === "" ? "" : Number(v));
                                                    }}
                                                    className="h-9 w-[70px] rounded-lg border border-gray-300 bg-transparent px-2 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 text-center "
                                                />
                                                <button
                                                    type="button"
                                                    disabled={saving === true || draftNote === "" || isNaN(Number(draftNote))}
                                                    onClick={() => void saveNote(s)}
                                                    className="inline-flex h-9 w-9 items-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 justify-center"
                                                    title="Aceptar"
                                                >
                                                    <CheckLineIcon className="size-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={saving === true}
                                                    onClick={() => {
                                                        setEditingCi(null);
                                                        setDraftNote("");
                                                    }}
                                                    className="inline-flex h-9 w-9 items-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 justify-center"
                                                    title="Rechazar"
                                                >
                                                    <CloseLineIcon className="size-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 justify-center">
                                                <span>{typeof s.score === "number" ? s.score : "—"}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-center">
                                        <button
                                            type="button"
                                            onClick={() => openCommentModal(s)}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                                            title={s.description && s.description.length > 0 ? "Ver/editar comentario" : "Agregar comentario"}
                                        >
                                            <MoreDotIcon className={`size-4 ${s.description ? "text-black-500" : ""}`} />
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
                            variant="success"
                            title={alertTitle}
                            message={alertMessage}
                        />
                    </div>
                </div>
            )
            }
            {/* Modal de comentario */}
            <DisqualifyModal
                open={commentModalOpen}
                student={commentStudent}
                draft={commentDraft}
                saving={commentSaving}
                onChangeDraft={setCommentDraft}
                onSave={() => void saveComment()}
                onClose={closeCommentModal}
            />
            <ApprovePhaseModal
                open={openApproveModal}
                student={null}
                draft={approveDraft}
                saving={savingApprove}
                onChangeDraft={setApproveDraft}
                onSave={() => void handleApproveSave()}
                onClose={() => { if (!savingApprove) setOpenApproveModal(false); }}
            />
        </>
    )
}