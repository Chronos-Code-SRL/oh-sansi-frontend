import { useEffect, useState, useRef } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { scoreCutsService } from "../../api/services/ScoreCutsService";
import { CheckLineIcon, CloseLineIcon } from "../../icons";
import Alert from "../../components/ui/alert/Alert";

interface ScoreInputProps {
  olympiadId: number;
  areaId: number;
  levelId: number;
  phaseId: number;
  onChangeScoreCut?: (value: number) => void;
  phaseStatus: "Activa" | "Terminada" | "Sin empezar" | null;
}

export default function ScoreInput({
  olympiadId,
  areaId,
  levelId,
  phaseId,
  onChangeScoreCut,
  phaseStatus,
}: ScoreInputProps) {
  const [minScore, setMinScore] = useState<number>(0);
  const [currentMinScore, setCurrentMinScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(0);
  const [currentMaxScore, setCurrentMaxScore] = useState<number>(0);
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [_saveType, setSaveType] = useState<"umbral" | "maxima" | null>(null);
  const [editingMin, setEditingMin] = useState(false);
  const [editingMax, setEditingMax] = useState(false);
  const [canEditMaxScore, setCanEditMaxScore] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertVariant, setAlertVariant] = useState<"success" | "error">("error");
  const autoHideTimerRef = useRef<number | null>(null);
  const isBlocked = phaseStatus === "Terminada";

  function showAlert(
    title: string,
    message: string,
    variant: "success" | "error" = "error"
  ) {
    if (autoHideTimerRef.current !== null) {
      window.clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }

    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVariant(variant);
    setAlertOpen(true);

    autoHideTimerRef.current = window.setTimeout(() => {
      setAlertOpen(false);
      autoHideTimerRef.current = null;
    }, 4000);
  }


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: "umbral" | "maxima") => {
    if (e.key === "Enter") {
      if (type === "maxima" && !canEditMaxScore) {
        showAlert(
          "Edición bloqueada",
          "Ya existen competidores calificados. No puedes editar la nota máxima.",
          "error"
        );
        return;
      }

      if (type === "umbral") setEditingMin(false);
      if (type === "maxima") setEditingMax(false);

      handleUpdateWithType(type);
    }
  };


  const checkIfHasQualified = async () => {
    try {
      await scoreCutsService.checkQualified(
        olympiadId,
        phaseId,
        areaId,
        levelId
      );

      setCanEditMaxScore(true);
    } catch (error: any) {
      console.error("Error verificando competidores:", error);
      if (error?.response?.status === 403) {
        setCanEditMaxScore(false);
      }
    }
  };


  useEffect(() => {
    const fetchScores = async () => {
      if (!levelId || !phaseId) return;

      try {
        const scoreCuts = await scoreCutsService.getScoreCuts(olympiadId, areaId);

        const currentPhase = Array.isArray(scoreCuts)
          ? scoreCuts.find((phase) => phase.phase_id === phaseId)
          : null;

        const levelData = currentPhase?.olympiad_area_phase_level_grades?.find(
          (lg: any) => lg.level_grade?.level?.id === levelId
        );

        const firstMin = levelData?.score_cut ?? 0;
        const firstMax = levelData?.max_score ?? 0;

        setMinScore(firstMin);
        setCurrentMinScore(firstMin);
        setMaxScore(firstMax);
        setCurrentMaxScore(firstMax);

        onChangeScoreCut?.(firstMin);
      } catch (error) {
        console.error("Error al obtener umbral o nota máxima:", error);
      }
    };

    fetchScores();
    checkIfHasQualified();
  }, [olympiadId, areaId, levelId, phaseId]);


  const handleUpdateWithType = (type: "umbral" | "maxima") => {
    setSaveType(type);
    setTimeout(() => handleUpdate(type), 0);
  };


  const handleUpdate = async (type: "umbral" | "maxima") => {
    setLoading(true);
    setError("");

    try {
      const payload: any = {
        phase_id: phaseId,
        level_id: levelId,
      };

      if (type === "umbral") {
        payload.score_cut = minScore;
        await scoreCutsService.updateScoreCut(olympiadId, areaId, payload);
        setCurrentMinScore(minScore);
      }
      
      if (type === "maxima") {
        if (!canEditMaxScore) {
          showAlert(
            "Edición bloqueada",
            "Ya existen competidores calificados. No puedes editar la nota máxima.",
            "error"
          );
          return;
        }
        payload.max_score = maxScore;
        await scoreCutsService.updateMaxScore(olympiadId, areaId, payload);
        setCurrentMaxScore(maxScore);
      }

      setSuccessModal(true);
      onChangeScoreCut?.(minScore);
    } catch (error: any) {
      console.error("Error al actualizar valores:", error);
      setError("No se pudo guardar el cambio. Revisa la consola para más detalles.");
    } finally {
      setLoading(false);
      setSaveType(null);
    }
  };

  return (
    <>
      <ComponentCard
        title="Nota de Clasificación"
        className="max-w-3xl w-full mx-auto rounded-2xl p-4 shadow-lg"
      >
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-lg shadow-sm bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300 text-xs">Umbral actual</p>
                <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{currentMinScore}</p>
              </div>

              <div>
                <Label htmlFor="minScore">Nuevo umbral de calificación</Label>

                <div className="grid grid-cols-[1fr_auto_auto] gap-2 mt-1">
                  <div
                    onClick={() => {
                      if (isBlocked) {
                        showAlert(
                          "Fase bloqueada",
                          "Esta fase ya está terminada. No se permiten modificaciones.",
                          "error"
                        );
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e as any, "umbral")}
                    className="relative"
                  >
                    {isBlocked && (
                      <div
                        className="absolute inset-0 z-10 cursor-not-allowed"
                        onClick={() =>
                          showAlert(
                            "Fase bloqueada",
                            "Esta fase ya está terminada. No se permiten modificaciones.",
                            "error"
                          )
                        }
                      />
                    )}
                    <InputField
                      id="minScore"
                      type="number"
                      min={"1"}
                      value={minScore === 0 ? "" : minScore}
                      disabled={isBlocked}
                      onChange={(e) => {
                        if (isBlocked) {
                          showAlert(
                            "Fase bloqueada",
                            "Esta fase ya está terminada. No se permiten modificaciones.",
                            "error"
                          );
                          return;
                        }
                        const value = Number(e.target.value);
                        if (value < 0) return;
                        setMinScore(Number(e.target.value));
                        setEditingMin(true);
                      }}
                      placeholder="Ej. 51"
                      className="w-28 text-center"
                    />
                  </div>
                  <>
                    <button
                      type="button"
                      disabled={loading || !editingMin}
                      onClick={() => {
                        setEditingMin(false);
                        handleUpdateWithType("umbral");
                      }}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700
                            ${!editingMin ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`}
                    >
                      <CheckLineIcon className="usersize-4" />
                    </button>

                    <button
                      type="button"
                      disabled={loading || !editingMin}
                      onClick={() => {
                        setMinScore(currentMinScore);
                        setEditingMin(false);
                      }}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700
                            ${!editingMin ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`}
                    >
                      <CloseLineIcon className="size-4" />
                    </button>
                  </>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">

              <div className="p-3 rounded-lg shadow-sm bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300 text-xs">Nota máxima actual</p>
                <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{currentMaxScore}</p>
              </div>

              <div>
                <Label htmlFor="maxScore">Nueva nota máxima</Label>

                <div className="grid grid-cols-[1fr_auto_auto] gap-2 mt-1">
                  <div
                    onClick={() => {
                      if (!canEditMaxScore) {
                        showAlert(
                          "Edición bloqueada",
                          "Ya existen competidores calificados. No puedes editar la nota máxima.",
                          "error"
                        );
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e as any, "maxima")}
                    className="relative"
                  >
                    {!canEditMaxScore && (
                      <div
                        className="absolute inset-0 z-10 cursor-not-allowed"
                        onClick={() =>
                          showAlert(
                            "Edición bloqueada",
                            "Ya existen competidores calificados. No puedes editar la nota máxima.",
                            "error"
                          )
                        }
                      />
                    )}
                    <InputField
                      id="maxScore"
                      type="number"
                      min={"1"}
                      value={maxScore === 0 ? "" : maxScore}
                      disabled={isBlocked || !canEditMaxScore}
                      onChange={(e) => {
                        if (!canEditMaxScore) return;
                        const value = Number(e.target.value);
                        if (value < 0) return;
                        setMaxScore(value);
                        setEditingMax(true);
                      }}
                      placeholder="Ej: 100"
                      className={`w-28 text-center ${!canEditMaxScore ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                        }`}
                    />
                  </div>
                  <>
                    <button
                      type="button"
                      disabled={!canEditMaxScore || loading || !editingMax}
                      onClick={() => {
                        setEditingMax(false);
                        handleUpdateWithType("maxima");
                      }}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700
                              ${(!canEditMaxScore || !editingMax) ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`}
                    >
                      <CheckLineIcon className="usersize-4" />
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setMaxScore(currentMaxScore);
                        setEditingMax(false);
                      }}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700
                            ${(!canEditMaxScore || !editingMax) ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`}
                    >
                      <CloseLineIcon className="usersize-4" />
                    </button>
                  </>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
      </ComponentCard>

      <Modal
        isOpen={successModal}
        onClose={() => setSuccessModal(false)}
        className="max-w-md mx-auto shadow-lg"
      >
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            ¡Cambios guardados correctamente!
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Los valores fueron actualizados exitosamente.
          </p>

          <Button
            variant="primary"
            className="w-full mt-4"
            onClick={() => setSuccessModal(false)}
          >
            Aceptar
          </Button>
        </div>
      </Modal>

      {alertOpen && (
        <div
          className="fixed bottom-6 right-6 z-[1000] w-[360px] max-w-[92vw] pointer-events-none"
          role="presentation"
        >
          <div className="pointer-events-auto" role="alert" aria-live="polite">
            <Alert variant={alertVariant} title={alertTitle} message={alertMessage} />
          </div>
        </div>
      )}
    </>
  );
}