import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/modal/index";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { gradesService } from "../../api/grades";
import { levelGradesService } from "../../api/levelGradesService";

interface ConfigureAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  areaName: string; // Ejemplo: "Robótica 2"
}

export default function ConfigureAreaModal({
  isOpen,
  onClose,
  areaName,
}: ConfigureAreaModalProps) {
  const [levels, setLevels] = useState<any[]>([]);
  const [newLevelName, setNewLevelName] = useState("");
  const [startGrade, setStartGrade] = useState("");
  const [endGrade, setEndGrade] = useState("");
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);

  // Cargar grados desde el backend
  const fetchGrades = async () => {
    try {
      const gradesData = await gradesService.getGrades(); 
      setGrades(gradesData); 
    } catch (error) {
      console.error("Error al obtener los grados:", error);
    }
  };

  // Cargar niveles configurados desde el backend
  const fetchLevels = async () => {
    try {
      const olympiadId = 1; 
      const areaId = 1; 
      const response = await levelGradesService.getLevelsFromArea(
        olympiadId,
        areaId
      );
      setLevels(response.data);
    } catch (error) {
      console.error("Error al obtener los niveles:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGrades();
      fetchLevels();
    }
  }, [isOpen]);

  // Agregar nivel (POST)
  const handleAddLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLevelName || !startGrade || !endGrade) return;

    try {
      const olympiadId = 1;
      const areaId = 1;

      const startIndex = grades.findIndex((g) => g.name === startGrade);
      const endIndex = grades.findIndex((g) => g.name === endGrade);
      const selectedGrades = grades
        .slice(startIndex, endIndex + 1)
        .map((g) => g.id);

      const newLevelData = {
        level_name: newLevelName,
        grades: selectedGrades,
      };

      await levelGradesService.addLevelToArea(olympiadId, areaId, newLevelData);
      await fetchLevels();
      setNewLevelName("");
      setStartGrade("");
      setEndGrade("");
    } catch (error) {
      console.error("Error al agregar nivel:", error);
    }
  };

  // Eliminar nivel (DELETE)
  const handleRemoveLevel = async (id: number) => {
    const confirmDelete = window.confirm("¿Deseas eliminar este nivel?");
    if (!confirmDelete) return;

    try {
      const olympiadId = 1;
      const areaId = 1;
      await levelGradesService.removeLevelFromArea(olympiadId, areaId, {
        level_id: id,
      });
      await fetchLevels();
    } catch (error) {
      console.error("Error al eliminar nivel:", error);
    }
  };

  // Guardar configuración 
  const handleSave = () => {
    console.log("Configuración actual:", levels);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg"
      isFullscreen={false}
    >
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Configurar Área: {areaName}
        </h2>
        <Label>
          Define los niveles de competencia para esta área. Cada nivel puede
          abarcar uno o varios cursos consecutivos.
        </Label>

        {/* Agregar nuevo nivel */}
        <ComponentCard title="Agregar Nuevo Nivel">
          <form onSubmit={handleAddLevel} className="space-y-4">
            <div>
              <Label>Nombre del Nivel</Label>
              <InputField
                placeholder="Ej. Nivel Básico, Inicial, Avanzado"
                value={newLevelName}
                onChange={(e) => setNewLevelName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Curso Inicial</Label>
                <select
                  className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-800 dark:text-white"
                  value={startGrade}
                  onChange={(e) => setStartGrade(e.target.value)}
                >
                  <option value="">Selecciona curso inicial</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.name}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Curso Final</Label>
                <select
                  className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-800 dark:text-white"
                  value={endGrade}
                  onChange={(e) => setEndGrade(e.target.value)}
                >
                  <option value="">Selecciona curso final</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.name}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" className="px-6">
                + Agregar Nivel
              </Button>
            </div>
          </form>
        </ComponentCard>

        {/* Niveles configurados */}
        <ComponentCard title="Niveles Configurados">
          <div className="space-y-3">
            {levels.length > 0 ? (
              levels.map((level) => (
                <div
                  key={level.id}
                  className="flex items-center justify-between border rounded-md px-4 py-2 bg-gray-50 dark:bg-gray-800"
                >
                  <div>
                    <p className="font-semibold">{level.name}</p>
                    <p className="text-sm text-gray-500">{level.range}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveLevel(level.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500">
                No hay niveles configurados aún.
              </p>
            )}
          </div>
        </ComponentCard>

        {/* Botones inferiores */}
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar Configuración
          </Button>
        </div>
      </div>
    </Modal>
  );
}
