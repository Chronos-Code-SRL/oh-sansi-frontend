import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import { Modal } from "../../components/ui/modal/index";

export default function CreateArea() {
  const [areaName, setAreaName] = useState("");
  const [scoreThreshold, setScoreThreshold] = useState("");
  const [gradeThreshold, setGradeThreshold] = useState("");
  const [levels, setLevels] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!areaName.trim()) newErrors.areaName = "El nombre del área es obligatorio.";
    if (!scoreThreshold) newErrors.scoreThreshold = "El umbral de calificación es obligatorio.";
    if (!gradeThreshold) newErrors.gradeThreshold = "El umbral de nota es obligatorio.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = {
      areaName,
      scoreThreshold,
      gradeThreshold,
      levels,
    };

    console.log("Datos enviados: simulación", data);
    setIsModalOpen(true);
  };

  const addLevel = () => {
    setLevels([...levels, { name: "", grades: [] }]);
  };

  const removeLevel = (index: number) => {
    const updated = [...levels];
    updated.splice(index, 1);
    setLevels(updated);
  };

  return (
    <>
      <PageMeta
        title="Crear Área | Oh! SanSi"
        description="Página para registrar un área de competencia en la Olimpiada"
      />
      <TitleBreadCrumb pageTitle="Crear Área" />

      <form onSubmit={handleSubmit} className="space-y-8">
        <ComponentCard title="Datos del Área">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="areaName">Nombre del Área</Label>
              <InputField
                id="areaName"
                type="text"
                placeholder="Ej. Matemáticas, Robótica..."
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                error={!!errors.areaName}
                hint={errors.areaName}
              />
            </div>

            <div>
              <Label htmlFor="scoreThreshold">Umbral de Calificación</Label>
              <InputField
                id="scoreThreshold"
                type="number"
                placeholder="Ej. 70"
                value={scoreThreshold}
                onChange={(e) => setScoreThreshold(e.target.value)}
                error={!!errors.scoreThreshold}
                hint={errors.scoreThreshold}
              />
            </div>

            <div>
              <Label htmlFor="gradeThreshold">Umbral de Nota</Label>
              <InputField
                id="gradeThreshold"
                type="number"
                placeholder="Ej. 51"
                value={gradeThreshold}
                onChange={(e) => setGradeThreshold(e.target.value)}
                error={!!errors.gradeThreshold}
                hint={errors.gradeThreshold}
              />
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Niveles de Competencia">
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">
                Niveles configurados
              </Label>
              <Button
                variant="outline"
                className="px-6"
                onClick={() => {
                  addLevel();
                }}
              >
                + Agregar Nivel
              </Button>
            </div>

            {levels.map((level, index) => (
              <div key={index} className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <InputField
                    type="text"
                    placeholder="Nombre del nivel"
                    value={level.name}
                    onChange={(e) => {
                      const updated = [...levels];
                      updated[index].name = e.target.value;
                      setLevels(updated);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      removeLevel(index);
                    }}
                  >
                    Eliminar
                  </Button>
                </div>

                <p className="text-sm text-gray-500 italic">
                  (Lista de los grados disponibles)
                </p>
              </div>
            ))}

            <div className="pt-4">
              <Button size="md" variant="primary" className="w-full">
                Registrar Área
              </Button>
            </div>
          </div>
        </ComponentCard>
      </form>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showCloseButton={true}
        isFullscreen={false}
        className="max-w-md mx-auto shadow-lg"
      >
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            ¡Área registrada!
          </h2>
          <Label>Se registro correctamente el área.</Label>
          <Button
            size="md"
            variant="primary"
            className="w-full mt-4"
            onClick={() => setIsModalOpen(false)}
          >
            Aceptar
          </Button>
        </div>
      </Modal>
    </>
  );
}
