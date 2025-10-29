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
  const [scoreCut, setScoreCut] = useState<number>(0);
  const [currentCut, setCurrentCut] = useState<number>(0);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchScoreCuts = async () => {
      try {
        const result = await scoreCutsService.getScoreCuts(olympiadId, areaId);
        setData(result);

        const firstScore =
          Array.isArray(result) && result.length > 0
            ? result?.[0]?.olympiad_area_phase_level_grades?.[0]?.score_cut || 0
            : 0;

        setScoreCut(Number(firstScore));
        setCurrentCut(firstScore);
        onChangeScoreCut?.(Number(firstScore));
      } catch (error) {
        console.error("Error al obtener los umbrales:", error);
      }
    };
    fetchScoreCuts();
  }, [olympiadId, areaId]);

  const validate = () => {
    if (scoreCut === null || isNaN(Number(scoreCut))) {
      setError("El umbral es obligatorio.");
      return false;
    }
    if (scoreCut < 0 || scoreCut > 100) {
      setError("El umbral debe ser un número entre 0 y 100.");
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
        const payload = {
          phase_id: 1,
          level_id: Number(levelId),
          score_cut: Number(scoreCut),
        };
        await scoreCutsService.updateScoreCut(olympiadId, areaId, payload);
      }

      const updated = await scoreCutsService.getScoreCuts(olympiadId, areaId);
      setData(updated);

      const newCut =
        Array.isArray(updated) && updated.length > 0
          ? updated?.[0]?.olympiad_area_phase_level_grades?.[0]?.score_cut || 0
          : scoreCut;

      setCurrentCut(Number(newCut));
      setConfirmModal(false);
      setSuccessModal(true);
      onChangeScoreCut?.(Number(scoreCut));
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
                <Label htmlFor="currentCut">Umbral actual</Label>
                <InputField
                  id="currentCut"
                  type="number"
                  value={currentCut}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 opacity-100 cursor-default w-full"
                />
              </div>

              <div className="w-full">
                <Label htmlFor="scoreCut">Nuevo umbral de calificación</Label>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2 w-full">
                  <InputField
                    id="scoreCut"
                    type="number"
                    value={scoreCut}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setScoreCut(value);
                      onChangeScoreCut?.(value);
                    }}
                    placeholder="Ej. 60"
                    error={!!error}
                    hint={error}
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

      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)}>
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            ¿Desea aplicar el nuevo umbral?
          </h2>
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

      <Modal isOpen={successModal} onClose={() => setSuccessModal(false)}>
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            ¡Umbral actualizado!
          </h2>
          <Label>El nuevo umbral ha sido aplicado correctamente.</Label>
          <Button className="w-full mt-4" onClick={() => setSuccessModal(false)}>
            Aceptar
          </Button>
        </div>
      </Modal>
    </>
  );
}
