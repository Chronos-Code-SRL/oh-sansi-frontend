import { useEffect, useRef, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import { fetchStudents, Student } from "../../api/services/studentService";
import Badge from "../ui/badge/Badge";
import { CheckLineIcon, CloseLineIcon, CommentIcon } from "../../icons";
import Alert from "../ui/alert/Alert";
import CommentModal from "./CommentModal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import type { KeyboardEventHandler } from "react";


export default function TableStudent() {

    const [students, setStudents] = useState<Student[]>([]);
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
    const [commentStudent, setCommentStudent] = useState<Student | null>(null);

    function openCommentModal(student: Student): void {
        setCommentStudent(student);
        setCommentDraft(typeof student.descripcion === "string" ? student.descripcion : "");
        setCommentModalOpen(true);
    }
    function closeCommentModal(): void {
        if (commentSaving === true) return;
        setCommentModalOpen(false);
        setCommentStudent(null);
        setCommentDraft("");
    }

    async function saveComment(): Promise<void> {
        if (commentStudent === null) return;

        const texto = commentDraft.trim();
        // Si quieres permitir vacío como “sin descripción”, quita esta validación
        // if (texto.length === 0) { showAlert("Dato inválido", "Escribe un comentario."); return; }

        try {
            setCommentSaving(true);
            // TODO: Conecta tu endpoint real:
            // await updateStudentDescription(commentStudent.ci, texto);

            // Actualiza el estado local
            setStudents((prev) =>
                prev.map((st) => (st.ci === commentStudent.ci ? { ...st, descripcion: texto } : st)),
            );

            // Feedback visual (toast inferior)
            showAlert("Comentario guardado", "Se guardó la retroalimentación del estudiante.");
            closeCommentModal();
        } catch {
            showAlert("Error", "No se pudo guardar el comentario. Intenta nuevamente.");
        } finally {
            setCommentSaving(false);
        }
    }

    useEffect(() => {
        let alive = true;

        async function cargarEstudiantes() {
            try {
                const data = await fetchStudents();
                if (alive) setStudents(data);
            } catch {
                if (alive) setError("No se pudo cargar la lista de estudiantes.");
            } finally {
                if (alive) setLoading(false);
            }
        }

        cargarEstudiantes();
        return () => { alive = false; };
    }, []);


    // Timer para autocerrar el Alert
    const autoHideTimerRef = useRef<number | null>(null);

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

    const startEdit = (s: Student) => {

        if (saving === true) {
            return
        };

        // Si ya está Evaluado, muestra la alerta y no entres a edición
        if (s.estado === "Evaluado") {
            showAlert(
                "Acción no permitida",
                `El estudiante ${s.nombre} ${s.apellido} ya está Evaluado.`
            );
            return;
        }

        setEditingCi(s.ci);
        if (typeof s.nota === "number") {
            setDraftNote(s.nota);
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

    const saveNote = async (s: Student) => {
        if (saving) return;
        if (draftNote === "" || isNaN(Number(draftNote))) return;
        const nota = Math.max(0, Math.min(100, Number(draftNote)));

        try {
            setSaving(true);
            // TODO: descomenta cuando tengas el endpoint
            // await updateStudentGrade(s.ci, nota);
            setStudents((prev) =>
                prev.map((st) =>
                    st.ci === s.ci ? { ...st, nota, estado: "Evaluado" } : st,
                ),
            );
            setEditingCi(null);
        } catch {
            setError("No se pudo guardar la nota.");
        } finally {
            setSaving(false);
        }
    };

    const rejectNote = async (s: Student) => {
        if (saving) return;
        try {
            setSaving(true);
            // TODO: descomenta cuando tengas el endpoint
            // await updateStudentGrade(s.ci, null);
            // setStudents((prev) =>
            //     prev.map((st) =>
            //         st.ci === s.ci ? { ...st, nota: undefined, estado: "No evaluado" } : st,
            //     ),
            // );
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
            const s = students.find((x) => x.ci === editingCi);
            if (s) void saveNote(s);
        }
        // if (e.key === "Escape") {
        //     cancelEdit();
        // }
    };

    return (
        <>
            <ComponentCard title="Quimica">
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
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Descripción</th>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading === true && (
                            <TableRow>
                                {/* <TableCell colSpan={8} className="px-6 py-4 text-sm text-foreground">Cargando...</TableCell> */}
                                <td colSpan={8} className="px-6 py-4 text-sm text-foreground">Cargando...</td>
                            </TableRow>
                        )}
                        {error !== null && loading === false && (
                            <TableRow>
                                {/* <TableCell colSpan={8} className="px-6 py-4 text-sm text-red-600">{error}</TableCell> */}
                                <td colSpan={8} className="px-6 py-4 text-sm text-red-600">{error}</td>
                            </TableRow>
                        )}
                        {loading === false && error === null && students.map((s) => {
                            const isEditing = editingCi === s.ci;
                            return (
                                <TableRow key={s.ci} className="border-b border-border last:border-0">
                                    <td className="px-6 py-4 text-sm">{s.nombre}</td>
                                    <td className="px-6 py-4 text-sm">{s.apellido}</td>
                                    <td className="px-6 py-4 text-sm">{s.ci}</td>
                                    <td className="px-6 py-4 text-sm">{s.nivel}</td>
                                    <td className="px-6 py-4 text-sm">{s.grado}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <Badge color={s.estado === "Evaluado" ? "success" : "error"}>
                                            {s.estado}
                                        </Badge>
                                    </td>

                                    {/* Nota */}
                                    <td className={`px-6 py-4 text-sm ${isEditing === false && s.estado !== "Evaluado" ? "cursor-text" : ""}`}
                                        onClick={() => {
                                            if (isEditing === false) {
                                                startEdit(s);
                                            }
                                        }}
                                    >
                                        {isEditing === true ? (
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
                                                    className="h-9 w-[70px] rounded-lg border border-gray-300 bg-transparent px-2 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 "
                                                />
                                                <button
                                                    type="button"
                                                    disabled={saving === true || draftNote === "" || isNaN(Number(draftNote))}
                                                    onClick={() => saveNote(s)} //Aca en el end point patch
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                                    title="Aceptar"
                                                >
                                                    <CheckLineIcon className="size-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={saving === true}
                                                    onClick={() => rejectNote(s)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                                    title="Rechazar"
                                                >
                                                    <CloseLineIcon className="size-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <span>{typeof s.nota === "number" ? s.nota : "—"}</span>
                                                {/* Solo permitir edición cuando no está evaluado */}

                                            </div>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-sm">
                                        <button
                                            type="button"
                                            onClick={() => openCommentModal(s)}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
                                            title={s.descripcion && s.descripcion.length > 0 ? "Ver/editar comentario" : "Agregar comentario"}
                                        >
                                            <CommentIcon className={`size-4 ${s.descripcion ? "text-black-500" : ""}`} />
                                        </button>
                                    </td>
                                </TableRow>
                            );
                        })}
                    </TableBody>

                </Table>
            </ComponentCard>
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
            )}
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
