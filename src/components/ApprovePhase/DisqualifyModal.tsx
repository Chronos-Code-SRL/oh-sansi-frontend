import { createPortal } from "react-dom";
import { Contestant } from "../../types/Contestant";
import { useEffect } from "react";
import { AlertHexaIcon } from "../../icons";

interface DisqualifyModalProps {
    open: boolean;
    student: Contestant | null;
    draft: string;
    saving: boolean;
    onChangeDraft: (value: string) => void;
    onSave: () => void;
    onClose: () => void;
}

export default function DisqualifyModal({
    open,
    student,
    draft,
    saving,
    onChangeDraft,
    onSave,
    onClose,
}: DisqualifyModalProps) {

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
            className="fixed inset-0 z-[2147483647] flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="disqualify-title"
        >
            <div className="absolute inset-0 bg-black/55" onClick={onClose} />

            <div className="relative z-10 w-[620px] max-w-[92vw] rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
                
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <AlertHexaIcon/>
                            <h2 id="disqualify-title" className="text-lg font-semibold text-gray-900">
                                Deslasificar Competidor
                            </h2>
                        </div>

                        {student && (
                            <p className="mt-1 text-sm text-gray-700">
                                Estás a punto de deslasificar a <strong>{student.first_name} {student.last_name}</strong>.
                                Esta acción indica que el competidor no ha cumplido con las reglas de ética y 
                                comportamiento definidas en la convocatoria.
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

                {/* Textarea */}
                <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                        Descripción del motivo de desclasificación *
                    </label>

                    <textarea
                        value={draft}
                        onChange={(e) => onChangeDraft(e.target.value)}
                        placeholder="Describe el motivo de la descalificación..."
                        className="block h-40 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-300 focus:outline-hidden focus:ring-3 focus:ring-yellow-500/10"
                    />

                    <p className="mt-1 text-xs text-gray-500">
                        Este campo es obligatorio y quedará registrado.
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saving || draft.trim().length === 0}
                        className="inline-flex items-center justify-center rounded-md bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700 disabled:opacity-50"
                    >
                        Confirmar Desclasificación
                    </button>
                </div>

            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
