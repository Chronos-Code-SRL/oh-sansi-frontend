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
  const [confirmModal, setConfirmModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchScores = async () => {
      if (!levelId || !phaseId) return;
      try {
        const [scoreCuts, maxScores] = await Promise.all([
          scoreCutsService.getScoreCuts(olympiadId, areaId),
          scoreCutsService.getMaxScores(olympiadId, areaId),
        ]);

        const levelCut = Array.isArray(scoreCuts)
          ? scoreCuts.find(
              (item) =>
                item.level_id === levelId &&
                item.phase_id === phaseId
            )
          : null;

        const levelMax = Array.isArray(maxScores)
          ? maxScores.find(
              (item) =>
                item.level_id === levelId &&
                item.phase_id === phaseId
            )
          : null;

        const firstMin = levelCut?.score_cut ?? 0;
        const firstMax = levelMax?.max_score ?? 0;

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

  const validate = () => {
    if (minScore === null || isNaN(Number(minScore))) {
      setError("El umbral mínimo es obligatorio.");
      return false;
    }
    if (minScore < 0) {
      setError("El umbral no puede ser negativo.");
      return false;
    }
    if (maxScore === null || isNaN(Number(maxScore))) {
      setError("La nota máxima es obligatoria.");
      return false;
    }
    if (maxScore <= minScore) {
      setError("La nota máxima debe ser mayor que el umbral mínimo.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setConfirmModal(true);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const minPayload = {
        phase_id: phaseId, 
        level_id: levelId,
        score_cut: minScore,
      };
      await scoreCutsService.updateScoreCut(olympiadId, areaId, minPayload);

      const maxPayload = {
        phase_id: phaseId, 
        level_id: levelId,
        max_score: maxScore,
      };
      await scoreCutsService.updateMaxScore(olympiadId, areaId, maxPayload);

      setCurrentMinScore(minScore);
      setCurrentMaxScore(maxScore);

      setConfirmModal(false);
      setSuccessModal(true);
      onChangeScoreCut?.(minScore);
    } catch (error) {
      console.error("Error al actualizar valores:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full">
        <ComponentCard title="Nota de Clasificación">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="w-full">
                <Label htmlFor="currentMinScore">Umbral actual</Label>
                <InputField
                  id="currentMinScore"
                  type="number"
                  value={currentMinScore}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 opacity-100 cursor-default w-full"
                />
              </div>

              <div className="w-full">
                <Label htmlFor="minScore">Nuevo umbral de calificación</Label>
                <InputField
                  id="minScore"
                  type="number"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  placeholder="Ej. 60"
                  error={!!error}
                  hint={error}
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <Label htmlFor="currentMaxScore">Nota máxima actual</Label>
                <InputField
                  id="currentMaxScore"
                  type="number"
                  value={currentMaxScore}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 opacity-100 cursor-default w-full"
                />
              </div>

              <div className="w-full">
                <Label htmlFor="maxScore">Nueva nota máxima</Label>
                <InputField
                  id="maxScore"
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  placeholder="Ej. 100"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                size="md"
                variant="primary"
                type="submit"
                disabled={loading}
                className="px-8"
              >
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>

            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        </ComponentCard>
      </form>

      <Modal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        className="max-w-md mx-auto shadow-lg"
      >
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            ¿Desea aplicar los nuevos cambios?
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Umbral mínimo: <strong>{minScore}</strong> &nbsp;|&nbsp; Nota máxima:{" "}
            <strong>{maxScore}</strong>
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmModal(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdate}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Guardando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={successModal}
        onClose={() => setSuccessModal(false)}
        className="max-w-md mx-auto shadow-lg"
      >
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            ¡Valores actualizados correctamente!
          </h2>
          <Label>El nuevo umbral y la nota máxima fueron aplicados con éxito.</Label>
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
