import { useEffect, useRef, useState } from "react";
import Badge from "../ui/badge/Badge";
import { CheckLineIcon, CommentIcon } from "../../icons";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import { Contestant, Evaluation } from "../../types/Contestant";
import { updatePartialEvaluation, getContestantByPhaseOlympiadAreaLevel, checkUpdates } from "../../api/services/contestantService";
import Select from "../form/Select";
import { getLevelsByOlympiadAndArea } from "../../api/services/levelGradesService";
import { LevelOption } from "../../types/Level";
import SearchBar from "../Grade/Searcher";
import Filter from "../Grade/Filter";
import CommentModal from "../Grade/CommentModal";
import Button from "../ui/button/Button";

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

    const [levels, setLevels] = useState<LevelOption[]>([]);
    const [levelsLoading, setLevelsLoading] = useState(false);
    const [levelsError, setLevelsError] = useState<string | null>(null);

    // Polling refs
    const lastUpdateAtRef = useRef<string | null>(null);
    const pollingRef = useRef<number | null>(null);

    const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilters, setSelectedFilters] = useState({
        estado: [] as string[],
        grado: [] as string[],
    });

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
            return;
        }
        const levelId = selectedLevelId; // ahora TypeScript sabe que es number

        let alive = true;
        setLoading(true);
        setError(null);
        async function loadContestants() {
            try {
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
            selectedFilters.estado.includes(statusLabel(s.status)); // <- mapear boolean a string

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
            // showAlert("Comentario guardado", "Se guardó la retroalimentación del estudiante.");
            closeCommentModal();
        } catch {
            // showAlert("Error", "No se pudo guardar el comentario. Intenta nuevamente.");
        } finally {
            setCommentSaving(false);
        }
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Competidores */}
                <div className="p-4 rounded-xl shadow bg-white border">
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                        Total competidores
                    </p>
                    <p className="text-3xl font-bold mt-2">{students.length}</p>
                </div>

                {/* Clasificados */}
                <div className="p-4 rounded-xl shadow bg-white border">
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                        Clasificados
                    </p>
                    <p className="text-3xl font-bold mt-2 text-green-600">
                        {students.filter(s => s.status === true).length}
                    </p>
                </div>

                {/* No clasificados */}
                <div className="p-4 rounded-xl shadow bg-white border">
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                        No clasificados
                    </p>
                    <p className="text-3xl font-bold mt-2 text-red-600">
                        {/* {students.filter(s => s.status === false && s.score < 51).length} */}
                    </p>
                </div>

                {/* Desclasificados */}
                <div className="p-4 rounded-xl shadow bg-white border">
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                        Desclasificados
                    </p>
                    <p className="text-3xl font-bold mt-2 text-yellow-600">
                        {/* {students.filter(s => s.status === false && s.score >= 51).length} */}
                    </p>
                </div>

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
                    type="submit"
                    size="sm"
                    onClick={() => {
                        // Lógica 
                    }}
                    startIcon={<CheckLineIcon className="w-5 h-5" />}
                >
                    Avalar Fase
                </Button>
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
                                        {s.classification_status === "desclasificado" && (
                                            <Badge color="warning">Desclasificado</Badge>
                                        )}
                                        
                                        {(!s.classification_status || (s.classification_status as any) === null) && (
                                            <Badge color="light">—</Badge>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-center">{s.score} </td>
                                    <td className="px-6 py-4 text-sm text-center">
                                        <button
                                            type="button"
                                            onClick={() => openCommentModal(s)}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
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
            {/* {alertOpen && (
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
            } */}
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