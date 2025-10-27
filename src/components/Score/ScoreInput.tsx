import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import { Modal } from "../../components/ui/modal";
import { scoreCutsService } from "../../api/services/ScoreCutsService";

export default function ScoreInput() {
  const olympiadId = 1;
  const areaId = 2;

  const [data, setData] = useState<any>(null);
  const [scoreCut, setScoreCut] = useState<number | "">("");
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
          result?.[0]?.olympiad_area_phase_level_grades?.[0]?.score_cut || "";

        setScoreCut(firstScore);
      } catch (error) {
        console.error("Error al obtener los umbrales:", error);
      }
    };
    fetchScoreCuts();
  }, []);

  const validate = () => {
    if (scoreCut === "" || scoreCut === null) {
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

      for (const fase of fases) {
        const levelGrades: any[] =
          fase.level_grades || fase.olympiad_area_phase_level_grades || [];

        const uniqueLevels: number[] = Array.from(
          new Set(
            levelGrades.map((lg: any) =>
              Number(lg?.level_grade?.level?.id || 0)
            )
          )
        ).filter((id) => id !== 0);

        const phaseId = fase.id || fase.phase_id;

        if (phaseId && uniqueLevels.length > 0) {
          console.log("🌀 Actualizando Fase ID:", phaseId);
          for (const levelId of uniqueLevels) {
            console.log("   → Nivel:", levelId, "Nuevo umbral:", scoreCut);
            await scoreCutsService.updateScoreCut(olympiadId, areaId, {
              phase_id: phaseId, 
              level_id: levelId,
              score_cut: Number(scoreCut),
            });
          }
        }
      }
      setConfirmModal(false);
      setSuccessModal(true);
    } catch (error) {
      console.error("Error al actualizar los umbrales:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TitleBreadCrumb pageTitle="Editar Umbral de Calificación" />

      <form onSubmit={handleSubmit}>
        <ComponentCard title="Modificar Umbral de Clasificación">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label htmlFor="scoreCut">Nuevo umbral de calificación</Label>
              <InputField
                id="scoreCut"
                type="number"
                value={scoreCut}
                onChange={(e) =>
                  setScoreCut(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="Ej. 60"
                error={!!error}
                hint={error}
              />
            </div>

            <Button size="md" variant="primary" className="w-full" type="submit">
              Guardar cambios
            </Button>
          </div>
        </ComponentCard>
      </form>

      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)}>
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            ¿Desea aplicar el nuevo umbral a todos los niveles del área?
          </h2>
          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmModal(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateAll}
              disabled={loading}
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
          <Label>
            El nuevo umbral ha sido aplicado correctamente a todos los niveles
            del área.
          </Label>
          <Button
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
