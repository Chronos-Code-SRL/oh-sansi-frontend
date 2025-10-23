import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import { fetchStudents, Student } from "../../api/services/studentService";
import Badge from "../ui/badge/Badge";
import { CheckLineIcon, CloseLineIcon } from "../../icons";


export default function TableStudent() {

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // States for editing notes in time real
    const [editingCi, setEditingCi] = useState<string | null>(null);
    const [draftNote, setDraftNote] = useState<number | "">("");
    const [saving, setSaving] = useState(false);

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

    const startEdit = (s: Student) => {

        if (saving === true) {
            return
        };
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

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
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
                <table className="w-full">
                    <thead className="border-b border-border bg-muted/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nombre</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Apellido</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">CI</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nivel</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Grado</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Estado</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nota</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading === true && (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-sm text-foreground">Cargando...</td>
                            </tr>
                        )}
                        {error !== null && loading === false && (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-sm text-red-600">{error}</td>
                            </tr>
                        )}
                        {loading === false && error === null && students.map((s) => {
                            const isEditing = editingCi === s.ci;
                            return (
                                <tr key={s.ci} className="border-b border-border last:border-0">
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
                                            if (!isEditing && s.estado !== "Evaluado") startEdit(s);
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
                                                    className="h-9 w-[70px] rounded-lg border border-gray-300 bg-transparent px-2 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={saving === true || draftNote === "" || isNaN(Number(draftNote))}
                                                    onClick={() => saveNote(s)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
                                                    title="Aceptar"
                                                >
                                                    <CheckLineIcon className="size-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={saving === true}
                                                    onClick={() => rejectNote(s)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
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

                                    <td className="px-6 py-4 text-sm">{s.descripcion ?? "—"}</td>
                                </tr>
                            );
                        })}
                    </tbody>

                </table>
            </ComponentCard>
        </>
    )
}
