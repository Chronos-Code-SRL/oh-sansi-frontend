import { Student } from "../../api/services/studentService";

interface CommentModalProps {
    open: boolean;
    student: Student | null;
    draft: string;
    saving: boolean;
    onChangeDraft: (value: string) => void;
    onSave: () => void;
    onClose: () => void;
}

export default function CommentModal({
    open,
    student,
    draft,
    saving,
    onChangeDraft,
    onSave,
    onClose,
}: CommentModalProps) {

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[1100] flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="comment-title"
        >
            {/* Fondo oscuro */}
            <div className="absolute inset-0 bg-black/55" onClick={onClose} />

            {/* Contenido */}
            <div className="relative z-10 w-[640px] max-w-[92vw] rounded-xl border border-gray-200 bg-white p-5 shadow-2xl">
                <div className="mb-3 flex items-start justify-between">
                    <div>
                        <h2 id="comment-title" className="text-base font-semibold text-gray-900">
                            Retroalimentación del Estudiante
                        </h2>
                        {student && (
                            <p className="text-sm text-gray-600">
                                {student.nombre} {student.apellido}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        ×
                    </button>
                </div>

                <div>
                    <textarea
                        value={draft}
                        onChange={(e) => onChangeDraft(e.target.value)}
                        placeholder="Escribir retroalimentación para el estudiante..."
                        className="block h-48 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                    />
                    <div className="mt-2 text-right text-xs text-gray-500">
                        {draft.length} caracteres
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-md bg-brand-600 px-3 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}