import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import { Modal } from "../../components/ui/modal";
import { scoreCutsService } from "../../api/services/ScoreCutsService";

interface ScoreInputProps {
  olympiadId: number;
  areaId: number;
  onChangeScoreCut?: (value: number) => void;
}

export default function ScoreInput({
  olympiadId,
  areaId,
  onChangeScoreCut,
}: ScoreInputProps) {
  const [data, setData] = useState<any>(null);
  const [minScore, setMinScore] = useState<number>(0); 
  const [currentMinScore, setCurrentMinScore] = useState<number>(0); 
  const [maxScore, setMaxScore] = useState<number>(0);
  const [currentMaxScore, setCurrentMaxScore] = useState<number>(0);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoreCuts, maxScores] = await Promise.all([
          scoreCutsService.getScoreCuts(olympiadId, areaId),
          scoreCutsService.getMaxScores(olympiadId, areaId),
        ]);

        setData(scoreCuts); 

        const firstMin =
          Array.isArray(scoreCuts) && scoreCuts.length > 0
            ? scoreCuts?.[0]?.olympiad_area_phase_level_grades?.[0]?.score_cut || 0
            : 0;

        const firstMax =
          Array.isArray(maxScores) && maxScores.length > 0
            ? maxScores?.[0]?.olympiad_area_phase_level_grades?.[0]?.max_score || 100
            : 100;

        setMinScore(Number(firstMin));
        setCurrentMinScore(Number(firstMin));
        setMaxScore(Number(firstMax));
        setCurrentMaxScore(Number(firstMax));
        onChangeScoreCut?.(Number(firstMin));
      } catch (error) {
        console.error("Error al obtener los umbrales o notas máximas:", error);
      }
    };

    fetchData();
  }, [olympiadId, areaId]);


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

  const handleUpdateAll = async () => {
    setLoading(true);
    try {
      if (!data) return;

      const fases = Array.isArray(data) ? data : data.phases || [data];
      const nivelesUnicos = new Set<number>();

      for (const fase of fases) {
        const levelGrades: any[] =
          fase.level_grades || fase.olympiad_area_phase_level_grades || [];

        for (const lg of levelGrades) {
          const levelId =
            lg?.level_id ||
            lg?.level_grade?.level?.id ||
            lg?.level_grade_id;

          if (levelId) nivelesUnicos.add(Number(levelId));
        }
      }

      for (const levelId of nivelesUnicos) {
        const minPayload = {
          phase_id: 1,
          level_id: Number(levelId),
          score_cut: Number(minScore),
        };
        await scoreCutsService.updateScoreCut(olympiadId, areaId, minPayload);

        const maxPayload = {
          phase_id: 1,
          level_id: Number(levelId),
          max_score: Number(maxScore),
        };
        await scoreCutsService.updateMaxScore(olympiadId, areaId, maxPayload);
      }

      const updated = await scoreCutsService.getScoreCuts(olympiadId, areaId);
      setData(updated);

      const updatedMin =
        Array.isArray(updated) && updated.length > 0
          ? updated?.[0]?.olympiad_area_phase_level_grades?.[0]?.score_cut || minScore
          : minScore;

      const updatedMax =
        Array.isArray(updated) && updated.length > 0
          ? updated?.[0]?.olympiad_area_phase_level_grades?.[0]?.max_score || maxScore
          : maxScore;

      setCurrentMinScore(Number(updatedMin));
      setCurrentMaxScore(Number(updatedMax));

      setConfirmModal(false);
      setSuccessModal(true);
      onChangeScoreCut?.(Number(minScore));
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <TitleBreadCrumb pageTitle="Editar Umbral de Calificación" />

      <form onSubmit={handleSubmit} className="w-full">
        <ComponentCard title="Umbral de Clasificación">
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2 w-full">
                  <InputField
                    id="minScore"
                    type="number"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    placeholder="Ej. 60"
                    error={!!error}
                    hint={error}
                    className="w-full sm:flex-1"
                  />
                </div>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2 w-full">
                  <InputField
                    id="maxScore"
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    placeholder="Ej. 100"
                    className="w-full sm:flex-1"
                  />
                  <Button
                    size="md"
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>
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
            Umbral mínimo: <strong>{minScore}</strong> &nbsp;|&nbsp; Nota máxima: <strong>{maxScore}</strong>
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
              onClick={handleUpdateAll}
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
