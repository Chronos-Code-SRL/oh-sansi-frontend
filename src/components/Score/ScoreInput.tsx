import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import { Modal } from "../../components/ui/modal";
import { ScoreCutsApi } from "../../api/services/ScoreCutsService";

export default function ScoreInput() {
  const [ScoreCuts, setScoreCuts] = useState<number | "">("");
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    const fetchScoreCuts = async () => {
        try {
        const olympiadId = 1; // temporal
        const areaId = 2;     // temporal
        const response = await ScoreCutsApi.getScoreCuts(olympiadId, areaId);
        console.log(response.data);
        // Ejemplo para tomar el primer score_cut
        const firstScoreCut = response.data[0]?.olympiad_area_phase_level_grades[0]?.score_cut || 0;
        setScoreCuts(firstScoreCut);
        } catch (err) {
        console.error("Error al obtener el umbral:", err);
        }
    };
    fetchScoreCuts();
    }, []);

  const validate = () => {
    if (ScoreCuts === "" || ScoreCuts === null) {
      setError("El umbral es obligatorio.");
      return false;
    }
    if (ScoreCuts < 0 || ScoreCuts > 100) {
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

  
  const handleConfirm = async () => {
    try {
        const olympiadId = 1;
        const areaId = 2;
        const data = {
        phase_id: 1,
        level_id: 2,
        score_cut: Number(ScoreCuts),
        };
        const result = await ScoreCutsApi.updateScoreCuts(olympiadId, areaId, data);
        console.log("Resultado:", result);
        setConfirmModal(false);
        setSuccessModal(true);
    } catch (err) {
        alert("Error al actualizar el umbral");
    }
    };


  return (
    <>
      <TitleBreadCrumb pageTitle="Editar Umbral de Calificación" />

      <form onSubmit={handleSubmit}>
        <ComponentCard title="Modificar Umbral de Clasificación">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label htmlFor="ScoreCuts">Umbral de calificación</Label>
              <InputField
                id="ScoreCuts"
                type="number"
                value={ScoreCuts}
                onChange={(e) => setScoreCuts(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Ej. 60"
                error={!!error}
                hint={error}
              />
            </div>

            <Button size="md" variant="primary" className="w-full">
              Guardar cambios
            </Button>
          </div>
        </ComponentCard>
      </form>

      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)}>
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            ¿Desea guardar los cambios del umbral?
          </h2>
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="outline" onClick={() => setConfirmModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleConfirm}>Confirmar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Éxito */}
      <Modal isOpen={successModal} onClose={() => setSuccessModal(false)}>
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            ¡Umbral actualizado!
          </h2>
          <Label>El umbral de calificación ha sido actualizado correctamente.</Label>
          <Button className="w-full mt-4" onClick={() => setSuccessModal(false)}>
            Aceptar
          </Button>
        </div>
      </Modal>
    </>
  );
}
