import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { scoreCutsService } from "../../api/services/ScoreCutsService";

interface ScoreInputProps {
  olympiadId: number;
  areaId: number;
  levelId: number;
  phaseId: number;
  onChangeScoreCut?: (value: number) => void;
}

export default function ScoreInput({
  olympiadId,
  areaId,
  levelId,
  phaseId,
  onChangeScoreCut,
}: ScoreInputProps) {
  const [minScore, setMinScore] = useState<number>(0);
  const [currentMinScore, setCurrentMinScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(0);
  const [currentMaxScore, setCurrentMaxScore] = useState<number>(0);
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveType, setSaveType] = useState<"umbral" | "maxima" | null>(null);

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
      <ComponentCard title="Nota de Clasificación">
        <div className="flex flex-col gap-8">
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <Label htmlFor="currentMinScore">Umbral actual</Label>
                <InputField
                  id="currentMinScore"
                  type="number"
                  value={currentMinScore}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 w-full"
                />
              </div>

              <div>
                <Label htmlFor="minScore">Nuevo umbral de calificación</Label>
                <InputField
                  id="minScore"
                  type="number"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  placeholder="Ej. 60"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  size="md"
                  variant="primary"
                  disabled={loading}
                  onClick={() => handleUpdateWithType("umbral")}
                  className="w-full sm:w-auto mt-2"
                >
                  {loading && saveType === "umbral" ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <Label htmlFor="currentMaxScore">Nota máxima actual</Label>
                <InputField
                  id="currentMaxScore"
                  type="number"
                  value={currentMaxScore}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 w-full"
                />
              </div>

              <div>
                <Label htmlFor="maxScore">Nueva nota máxima</Label>
                <InputField
                  id="maxScore"
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  placeholder="Ej. 100"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  size="md"
                  variant="primary"
                  disabled={loading}
                  onClick={() => handleUpdateWithType("maxima")}
                  className="w-full sm:w-auto mt-2"
                >
                  {loading && saveType === "maxima" ? "Guardando..." : "Guardar"}
                </Button>
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
    </>
  );
}
