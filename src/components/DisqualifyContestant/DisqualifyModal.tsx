import { createPortal } from "react-dom";
import { Contestant } from "../../types/Contestant";
import { useEffect } from "react";
import { AlertHexaIcon } from "../../icons";
import Button from "../ui/button/Button";

interface DisqualifyModalProps {
    open: boolean;
    student: Contestant | null;
    draft: string;
    saving: boolean;
    onChangeDraft: (value: string) => void;
    onSave: () => void;
    onClose: () => void;
    readOnly?: boolean;
}

export default function DisqualifyModal({
    open,
    student,
    draft,
    saving,
    onChangeDraft,
    onSave,
    onClose,
    readOnly = false,
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
                            <AlertHexaIcon />
                            {readOnly === false ? (
                            <h2 id="disqualify-title" className="text-lg font-semibold text-gray-900">
                                Desclasificar Competidor
                            </h2>
                            ) : (
                            <h2 id="disqualify-title" className="text-lg font-semibold text-gray-900">
                                Competidor Desclasificado
                            </h2>
                            )}
                        </div>

                        {student && (
                            readOnly === false ? (
                                <p className="mt-1 text-sm text-gray-700">
                                    Se desclasificará a <strong>{student.first_name} {student.last_name}</strong>.
                                    Esta acción indica que el competidor no ha cumplido con las reglas de ética y
                                    comportamiento definidas en la convocatoria.
                                </p>
                            ) : (
                                <p className="mt-1 text-sm text-gray-700">
                                    Se desclasificó a: <strong>{student.first_name} {student.last_name}</strong>.
                                </p>
                            )
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
                {readOnly === false && (
                    <p className="mt-1 text-xs text-gray-500">
                        Este campo es obligatorio y quedará registrado en la evaluación del competidor.
                    </p>
                )}
                {/* Textarea */}
                <div className="mt-3">
                    <textarea
                        value={draft}
                        readOnly={readOnly}
                        tabIndex={readOnly ? -1 : undefined}
                        disabled={readOnly}
                        onChange={(e) => onChangeDraft(e.target.value)}
                        placeholder={readOnly ? "Modo solo lectura" : "Describe el motivo de la desclasificación..."}
                        className={`block h-40 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-300 focus:outline-hidden focus:ring-3 focus:ring-yellow-500/10
                         ${readOnly
                                ? 'bg-gray-100 border-gray-200 pointer-events-none'
                                : 'border-gray-300 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10'
                            }`}
                    />
                    {readOnly === false && (
                        <p className="mt-1 text-xs text-red-500">
                            Esta acción no se puede deshacer. Asegúrate de que las razones de desclasificación sean justificadas.
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-end gap-2">
                    <Button
                        size="sm"
                        onClick={onClose}
                        disabled={saving}
                        variant="outline"
                    >
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        onClick={onSave}
                        disabled={saving || draft.trim().length === 0 || readOnly}
                        variant="primary"
                    >
                        Confirmar Desclasificación
                    </Button>
                </div>

            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
