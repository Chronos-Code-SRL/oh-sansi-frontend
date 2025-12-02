
import { createPortal } from "react-dom";
import { Contestant } from "../../types/Contestant";
import { useEffect } from "react";

interface CommentModalProps {
    open: boolean;
    student: Contestant | null;
    draft: string;
    saving: boolean;
    onChangeDraft: (value: string) => void;
    onSave: () => void;
    onClose: () => void;
    readOnly?: boolean;
}

export default function CommentModal({
    open,
    student,
    draft,
    saving,
    onChangeDraft,
    onSave,
    onClose,
    readOnly = false,
}: CommentModalProps) {

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    if (!open) return null;

    const modal = (
        <div
            className="fixed inset-0 z-[2147483647] flex items-center justify-center" // z-index muy alto
            role="dialog"
            aria-modal="true"
            aria-labelledby="comment-title"
        >
            <div className="absolute inset-0 bg-black/55" onClick={onClose} />

            <div className="relative z-10 w-[640px] max-w-[92vw] rounded-xl border border-gray-200 bg-white p-5 shadow-2xl">
                <div className="mb-3 flex items-start justify-between">
                    <div>
                        <h2 id="comment-title" className="text-base font-semibold text-gray-900">
                            Retroalimentación del Estudiante
                        </h2>
                        {student && (
                            <p className="text-sm text-gray-600">
                                {student.first_name} {student.last_name}
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
                        onChange={(e) => { if (!readOnly) onChangeDraft(e.target.value); }}
                        readOnly={readOnly}
                        tabIndex={readOnly ? -1 : undefined}
                        disabled={readOnly}
                        placeholder={readOnly ? "Modo solo lectura" : "Escribir retroalimentación para el estudiante..."}
                        className={`block h-48 w-full resize-none rounded-lg border px-3 py-2 text-sm 
                            ${readOnly
                                ? 'bg-gray-100 border-gray-200 pointer-events-none'
                                : 'border-gray-300 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10'
                            }`}
                    />


                    <div className="mt-2 text-right text-xs text-gray-500">{draft.length} caracteres</div>
                </div>

                <div className="mt-5 flex items:center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={saving}
                            className="inline-flex items-center justify-center rounded-md bg-brand-600 px-3 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
                        >
                            Guardar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}