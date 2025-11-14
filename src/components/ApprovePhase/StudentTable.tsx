import { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import {  CommentIcon } from "../../icons";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import { Contestant } from "../../types/Contestant";
import {updatePartialEvaluation, getContestantByPhaseOlympiadAreaLevel } from "../../api/services/contestantService";
import Select from "../form/Select";
import { getLevelsByOlympiadAndArea } from "../../api/services/levelGradesService";
import { LevelOption } from "../../types/Level";
import SearchBar from "../Grade/Searcher";
import Filter from "../Grade/Filter";
import CommentModal from "../Grade/CommentModal";

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
    const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilters, setSelectedFilters] = useState({
        estado: [] as string[],
        nivel: [] as string[],
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
                                        <Badge color={s.status === true ? "success" : "error"}>
                                            {s.status ? "Evaluado" : "No Evaluado"}
                                        </Badge>
                                    </td>

                                    {/* Nota */}
                                    <td className="px-6 py-4 text-sm items-center justify-center">
                                        {s.score}
                                    </td>

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