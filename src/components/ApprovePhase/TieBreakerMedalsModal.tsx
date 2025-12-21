import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import Select from "../form/Select";
import { AlertHexaIcon } from "../../icons";
import { TieRequiringResolution, MedalAdjustment } from "./../../types/Tie";

interface Props {
  open: boolean;
  phaseName: string;
  ties: TieRequiringResolution[];
  onClose: () => void;
  onSaveAdjustments: (adjustments: MedalAdjustment[]) => Promise<void>;
}

const MEDAL_OPTIONS = [
  { label: "Oro", value: "Oro" },
  { label: "Plata", value: "Plata" },
  { label: "Bronce", value: "Bronce" },
  { label: "Mención Honorífica", value: "Mención Honorífica" },
];

export default function TieBreakerMedalsModal({
  open,
  phaseName,
  ties,
  onClose,
  onSaveAdjustments,
}: Props) {
  const [adjustments, setAdjustments] = useState<MedalAdjustment[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const initial: MedalAdjustment[] = [];
    ties.forEach(tie => {
      tie.evaluations.forEach(ev => {
        initial.push({
          evaluation_id: ev.evaluation_id,
          new_medal: tie.medal_type,
          justification: "",
        });
      });
    });

    setAdjustments(initial);
  }, [open, ties]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const updateAdjustment = (
    evaluationId: number,
    data: Partial<MedalAdjustment>
  ) => {
    setAdjustments(prev =>
      prev.map(a =>
        a.evaluation_id === evaluationId ? { ...a, ...data } : a
      )
    );
  };

  const handleSave = async () => {
    const invalid = adjustments.some(
      a => !a.new_medal || !a.justification.trim()
    );

    if (invalid) {
      alert("Debe asignar medalla y justificar todos los ajustes.");
      return;
    }

    setSaving(true);
    try {
      await onSaveAdjustments(adjustments);
    } finally {
      setSaving(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />

      <div className="relative z-10 w-[720px] max-w-[95vw] rounded-xl bg-white p-6 shadow-2xl">

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <AlertHexaIcon />
            <h2 className="text-lg font-semibold">Resolver Empates</h2>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Resuelva los empates para poder avalar la <b>{phaseName}</b>.
          </p>
        </div>

        {/* Body */}
        <div className="space-y-4 max-h-[55vh] overflow-y-auto">

          {ties.map((tie, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              {/* Tie header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <AlertHexaIcon />
                  {tie.medal_type}
                  <span className="text-sm text-gray-600">
                    Nota: {tie.score}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {tie.tied_count} empatados · {tie.available_in_category} cupos
                </div>
              </div>

              {/* Evaluations */}
              <div className="space-y-3">
                {tie.evaluations.map(ev => {
                  const adj = adjustments.find(
                    a => a.evaluation_id === ev.evaluation_id
                  );

                  return (
                    
                    <div
                      key={ev.evaluation_id}
                      className="grid grid-cols-[1fr_160px] gap-3 items-center"
                    >
                      <div>
                        <div className="font-medium">{ev.contestant_name}</div>
                        <textarea
                          className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
                          placeholder="Justificación"
                          value={adj?.justification ?? ""}
                          onChange={e =>
                            updateAdjustment(ev.evaluation_id, {
                              justification: e.target.value,
                            })
                          }
                        />
                      </div>

                      <Select
                        value={adj?.new_medal}
                        options={MEDAL_OPTIONS}
                        onChange={value =>
                          updateAdjustment(ev.evaluation_id, {
                            new_medal: value,
                          })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleSave}
           
          >
            Guardar y continuar
          </Button>
        </div>

      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
