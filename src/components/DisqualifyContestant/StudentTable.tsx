import { useEffect, useRef, useState } from "react";
import Badge from "../ui/badge/Badge";
import { MoreDotIcon } from "../../icons";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import { Contestant, Evaluation } from "../../types/Contestant";
import { getContestantByPhaseOlympiadAreaLevel, checkUpdates } from "../../api/services/contestantService";
import { updateClassification } from "../../api/services/classification";
import Select from "../form/Select";
import { getLevelsByOlympiadAndArea } from "../../api/services/levelGradesService";
import { LevelOption } from "../../types/Level";
import SearchBar from "../Grade/Searcher";
import Alert from "../ui/alert/Alert";
import { getPhaseStatus } from "../../api/services/phaseService";
import BoxFinishedPhase from "../common/BoxFinishedPhase";
import { BoxFaseLevel } from "../common/BoxPhasesLevel";
import DisqualifyModal from "./DisqualifyModal";

interface Props {
    idPhase: number;
    idOlympiad: number;
    idArea: number;
}

export default function StudentTable({ idPhase, idOlympiad, idArea }: Props) {
    const [phaseStatus, setPhaseStatus] = useState<"Activa" | "Terminada" | "Sin empezar" | null>(null);
    const [students, setStudents] = useState<Contestant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [commentDraft, setCommentDraft] = useState<string>("");
    const [commentSaving, setCommentSaving] = useState(false);
    const [commentStudent, setCommentStudent] = useState<Contestant | null>(null);

    const [levels, setLevels] = useState<LevelOption[]>([]);
    const [levelsLoading, setLevelsLoading] = useState(false);
    const [levelsError, setLevelsError] = useState<string | null>(null);


    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle, setAlertTitle] = useState<string>("");
    const [alertMessage, setAlertMessage] = useState<string>("");


    const lastUpdateAtRef = useRef<string | null>(null);
    const pollingRef = useRef<number | null>(null);

    const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
    const autoHideTimerRef = useRef<number | null>(null);

    const [searchQuery, setSearchQuery] = useState("");

    const getEvaluationId = (s: Contestant): number | string => {
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

    useEffect(() => {
        if (selectedLevelId == null) {
            setStudents([]);
            setLoading(false);
            setError(null);
            return;
        }
        const levelId = selectedLevelId;

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
            } catch (err) {
                console.warn("[StudentTable] getPhaseStatus error", err);
                if (alive) setPhaseStatus(null);
            }
        }
        void loadPhaseStatus();
        return () => { alive = false; };
    }, [selectedLevelId, idPhase, idOlympiad, idArea]);

    useEffect(() => {

        if (selectedLevelId == null) return;

        async function pollOnce() {
            const since = lastUpdateAtRef.current ?? new Date().toISOString();

            try {
                const res = await checkUpdates(since);

                if (Array.isArray(res.new_evaluations) && res.new_evaluations.length > 0) {

                    const byEvaluation = new Map<number, Evaluation>();
                    for (const ev of res.new_evaluations as any[]) {
                        const evalId = (typeof ev.evaluation_id === "number") ? ev.evaluation_id : (typeof ev.id === "number" ? ev.id : undefined);
                        if (typeof evalId === "number") byEvaluation.set(evalId as number, ev);
                    }

                    setStudents((prev) =>
                        prev.map((st) => {

                            const evalId = (st as any).evaluation_id as number | undefined;
                            const ev = (typeof evalId === "number") ? byEvaluation.get(evalId) : undefined;

                            if (!ev) return st;
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
                const serverLast = res?.last_updated_at ?? since;
                const t = new Date(serverLast);
                const safe = new Date(t.getTime() - 1).toISOString();
                lastUpdateAtRef.current = safe;
            } catch (err) {
                console.warn("[StudentTable] polling:error", err);
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
    }, [idPhase, idOlympiad, idArea, selectedLevelId]);


    const normalize = (text: string) =>
        text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filteredStudents = students.filter((s) => {
        const q = normalize(searchQuery);
        const matchesSearch =
            normalize(s.first_name).includes(q) ||
            normalize(s.last_name).includes(q) ||
            s.ci_document.toString().includes(q);


        return matchesSearch;
    });
    async function saveComment(): Promise<void> {
        if (commentStudent === null) return;
        if (phaseStatus === "Terminada") {
            showAlert("No editable", "La fase está terminada. No se permiten cambios.");
            return;
        }
        const texto = commentDraft.trim();

        try {
            setCommentSaving(true);
            const id = Number(getEvaluationId(commentStudent));
            await updateClassification(id, {
                classification_status: "descalificado",
                classification_place: null,
                description: texto,
            });

            setStudents((prev) =>
                prev.map((st) =>
                    st.ci_document === commentStudent.ci_document
                        ? { ...st, classification_status: "descalificado", description: texto }
                        : st,
                ),
            );

            closeCommentModal();
        } catch {
            showAlert("Error", "No se pudo guardar el comentario ni estado. Intenta nuevamente.");
        } finally {
            setCommentSaving(false);
        }
    }

    function showAlert(title: string, message: string): void {
        if (autoHideTimerRef.current !== null) {
            window.clearTimeout(autoHideTimerRef.current);
            autoHideTimerRef.current = null;
        }
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertOpen(true);

        autoHideTimerRef.current = window.setTimeout(() => {
            setAlertOpen(false);
            autoHideTimerRef.current = null;
        }, 3000);
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
            {phaseStatus === "Terminada" && (
                <div className="mb-4">
                    <BoxFinishedPhase />
                </div>
            )}
            {phaseStatus === "Sin empezar" && (
                <div className="mb-4">
                    <BoxFaseLevel
                        title={"Fase no iniciada"}
                        message={"Esta fase aún no ha comenzado. Espera a que se habilite para este nivel."}
                    />
                </div>
            )}

            <div className="relative xl:w-90 mb-4">
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
                    <div className="flex items-center flex-grow">
                        <SearchBar
                            onSearch={setSearchQuery}
                            placeholder="Buscar por nombre, apellido o CI..."
                        />
                    </div>
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
                                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Acción</th>
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
                                            {s.classification_status === "descalificado" && (
                                                <Badge color="warning">Desclasificado</Badge>
                                            )}
                                            {s.classification_status === null && (
                                                <Badge color="neutral">-</Badge>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-center">
                                            {typeof s.score === "number" ? s.score : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center">
                                            <button
                                                type="button"
                                                onClick={() => openCommentModal(s)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                                                title={s.description && s.description.length > 0 ? "Ver comentario" : "Agregar comentario"}
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
            <DisqualifyModal
                open={commentModalOpen}
                student={commentStudent}
                draft={commentDraft}
                saving={commentSaving}
                onChangeDraft={setCommentDraft}
                onSave={() => void saveComment()}
                onClose={closeCommentModal}
                readOnly={phaseStatus === "Terminada" || commentStudent?.classification_status === "descalificado"}
            />

        </>
    )
}