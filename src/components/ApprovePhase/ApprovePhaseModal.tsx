import { createPortal } from "react-dom";
import { useEffect } from "react";
import { AlertHexaIcon } from "../../icons";
import Button from "../ui/button/Button";
import { EndorseErrorItem } from "../../types/Phase";

interface ApprovePhaseModalProps {
    open: boolean;
    phaseName: string;
    draft: string;
    saving: boolean;
    onChangeDraft: (value: string) => void;
    onSave: () => void;
    onClose: () => void;
    errorMessage?: string;
    errorItems?: EndorseErrorItem[];
    requiresConfirmation?: boolean;
}

export default function ApprovePhaseModal({
    open,
    phaseName,
    saving,
    onSave,
    onClose,
    errorMessage,
    errorItems,
    requiresConfirmation = false,
}: ApprovePhaseModalProps) {

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

    const hasErrors = Boolean(errorMessage && !requiresConfirmation);

    const modal = (
        <div
            className="fixed inset-0 z-[2147483647] flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-phase-title"
        >
            <div className="absolute inset-0 bg-black/55" onClick={onClose} />

            <div className="relative z-10 w-[620px] max-w-[92vw] rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">

                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <AlertHexaIcon />
                            <h2 id="approve-phase-title" className="text-lg font-semibold text-gray-900">
                                {hasErrors ? "No se puede avalar" : "Avalar Fase"}
                            </h2>
                        </div>

                        <p className="mt-1 text-sm text-gray-700">
                            {hasErrors
                                ? errorMessage
                                : requiresConfirmation
                                    ? `Se detectaron empates en medallas. Confirme para avalar definitivamente la ${phaseName}.`
                                    : `Se avalará la ${phaseName} de este nivel. Esta acción indica que ya no se podrá modificar nada.`}
                        </p>
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

                {errorItems && errorItems.length > 0 && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4">
                        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-red-900">
                            {errorItems.map((it, idx) => (
                                <li key={idx} className="rounded-md bg-white p-3 border border-red-100">
                                    <p>
                                        <span className="font-semibold">Medalla {it.medal}</span>
                                    </p>
                                    <p>
                                        Hay <b>{it.count}</b> participantes empatados con nota{" "}
                                        <b>{Number(it.score).toFixed(2)}</b>, pero solo hay{" "}
                                        <b>{it.available}</b> medalla(s) disponible(s).
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-6 flex items-center justify-end gap-2">
                    {hasErrors ? (
                        <Button
                            size="sm"
                            onClick={onClose}
                            disabled={saving}
                            variant="primary"
                        >
                            Entendido
                        </Button>
                    ) : (
                        <>
                            <Button
                                size="sm"
                                onClick={onClose}
                                disabled={saving}
                                variant="outline"
                            >
                                {requiresConfirmation ? "Volver" : "Cancelar"}
                            </Button>
                            <Button
                                size="sm"
                                onClick={onSave}
                                variant="primary"
                                disabled={saving}
                            >
                                {requiresConfirmation ? "Confirmar aval" : (saving ? "Confirmando..." : "Avalar fase")}
                            </Button>
                        </>
                    )}
                </div>


            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
