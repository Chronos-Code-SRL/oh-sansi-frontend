import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/modal/index";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import { gradesService } from "../../api/grades";
import { levelGradesService } from "../../api/levelGradesService";
// import ButtonModal from "../../components/ui/button/ButtonModal";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";

interface ConfigureAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  areaName: string;
  olympiadId: number;
  areaId: number;
}

export default function ConfigureAreaModal({
  isOpen,
  onClose,
  areaName,
  olympiadId,
  areaId,
}: ConfigureAreaModalProps) {
  const [levels, setLevels] = useState<any[]>([]);
  const [newLevelName, setNewLevelName] = useState("");
  const [startGrade, setStartGrade] = useState("");
  const [endGrade, setEndGrade] = useState("");
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
  const [errors, setErrors] = useState<{ name?: string; startGrade?: string; endGrade?:string }>({});

  // Cargar grados desde el backend
  const fetchGrades = async () => {
    try {
      const gradesData = await gradesService.getGrades();
      setGrades(gradesData);
    } catch (error) {
      console.error("Error al obtener los grados:", error);
    }
  };

  interface LevelsResponse {
    level_grades: any[];
    [key: string]: any;
  }

  const fetchLevels = async () => {
    if (!olympiadId || !areaId) return;

    try {
      const levelsData = await levelGradesService.getLevelsFromArea(
        olympiadId,
        areaId
      ) as LevelsResponse;

      // Verifica si levelsData.level_grades existe, de lo contrario lanza un error
      if (!levelsData || !Array.isArray(levelsData.level_grades)) {
        console.error("Error: La API no devolvió un array válido de niveles.");
        return;
      }

      // Agrupamos por ID de nivel
      const groupedLevels = levelsData.level_grades.reduce((acc: any[], item: any) => {
        const levelId = item.level?.id || item.id;
        const existing = acc.find((l) => l.id === levelId);

        if (existing) {
          existing.grades.push(...(item.grades || [item.grade]));
        } else {
          acc.push({
            id: levelId,
            name: item.level?.name || item.name,
            grades: item.grades || [item.grade],
          });
        }
        return acc;
      }, []);

      // Eliminamos posibles duplicados de grado dentro de cada nivel
      const uniqueLevels = groupedLevels.map((level: any) => ({
        ...level,
        grades: level.grades.filter(
          (grade: any, index: number, self: any[]) =>
            index === self.findIndex((g: any) => g.id === grade.id)
        ),
      }));

      setLevels(uniqueLevels);
    } catch (error) {
      console.error("Error al obtener los niveles:", error);
    }
  };
  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchGrades();
      fetchLevels();
    }
  }, [isOpen]);

  const validateName = (name: string): string | null => {
    if (!name.trim()) return "El nombre del nivel es obligatorio.";

    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/.test(name))
      return "Solo se permiten caracteres alfanuméricos (letras, números y espacios).";
    return null;
  };

  const filteredEndGrades = () => {
    const startIndex = grades.findIndex((g) => g.name === startGrade);
    if (startIndex === -1) return grades;
    return grades.slice(startIndex);
  };

  // Agregar nivel (POST)
  const handleAddLevel = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(newLevelName);
    const newErrors: { name?: string; startGrade?: string; endGrade?: string } = {};

    if (nameError) {
      newErrors.name = nameError;
    }

    if (!startGrade) {
      newErrors.startGrade = "Debes seleccionar un curso inicial.";
    }

    if (!endGrade) {
      newErrors.endGrade = "Debes seleccionar un curso final.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // console.log("Enviando nivel a:", olympiadId, areaId);
      setErrors({}); 

      const startIndex = grades.findIndex((g) => g.name === startGrade);
      const endIndex = grades.findIndex((g) => g.name === endGrade);

      if (startIndex === -1 || endIndex === -1) {
        alert("Grados seleccionados no válidos.");
        return;
      }

      const selectedGrades = grades
        .slice(startIndex, endIndex + 1)
        .map((g) => g.id);

      const newLevelData = {
        level_name: newLevelName,
        grade_ids: selectedGrades,
      };

      // console.log("Datos enviados:", newLevelData);

      await levelGradesService.addLevelToArea(olympiadId, areaId, newLevelData);
      await fetchLevels();

      setNewLevelName("");
      setStartGrade("");
      setEndGrade("");
    } catch (error: any) {
      console.error("Error al agregar nivel:", error);
      alert("No se pudo agregar el nivel. Verifica la consola.");
    }
  };

  // Eliminar nivel (DELETE)
  const handleRemoveLevel = async (id: number) => {
    const confirmDelete = window.confirm("¿Deseas eliminar este nivel?");
    if (!confirmDelete) return;

    try {
      // Encuentra el nivel a eliminar
      const levelToDelete = levels.find((l) => l.id === id);
      if (!levelToDelete) {
        alert("No se encontró el nivel seleccionado.");
        return;
      }

      // console.log("Eliminando nivel con ID:", id);

      // Llama al servicio para eliminar el nivel
      await levelGradesService.removeLevelFromArea(olympiadId, areaId, id);

      // Actualiza los niveles después de eliminar
      await fetchLevels();
      alert("Nivel eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar nivel:", error);
      alert("No se pudo eliminar el nivel. Verifica la consola.");
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
                onChange={(e) => {
                    setNewLevelName(e.target.value);
                    setErrors({ ...errors, name: undefined });
                  }}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Curso Inicial</Label>
                 <Select
                  options={grades.map((grade) => ({
                    value: grade.name,
                    label: grade.name,
                  }))}
                  value={startGrade || ""}
                  onChange={(val) => {
                    setStartGrade(val);
                    setErrors({ ...errors, startGrade: undefined });
                  }}
                  placeholder="Selecciona curso inicial"
                />
                {errors.startGrade && (
                  <p className="text-sm text-red-500 mt-1">{errors.startGrade}</p>
                )}
              </div>

              <div>
                <Label>Curso Final</Label>
                <Select
                  options={filteredEndGrades().map((grade) => ({
                    value: grade.name,
                    label: grade.name,
                  }))}
                  value={endGrade || ""}
                  onChange={(val) => setEndGrade(val)}
                  placeholder="Selecciona curso final"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button type="submit" variant="outline" className="px-6">
                + Agregar Nivel
              </Button>
            </div>
          </form>
        </ComponentCard>

        {/* Niveles configurados */}
        <ComponentCard title="Niveles Configurados">
          <div className="space-y-3">
            {levels.length > 0 ? (
              levels.map((level: any, index: number) => (
                <div
                  key={`${level.id}-${index}`}
                  className="flex items-center justify-between border rounded-md px-4 py-2 bg-gray-50 dark:bg-gray-800"
                >
                  <div>
                    <p className="font-semibold">{level.name}</p>
                    {level.grades?.length > 0 ? (
                      <p className="text-sm text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full inline-block">
                        {level.grades[0].name} -{" "}
                        {level.grades[level.grades.length - 1].name}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">Sin grados asignados</p>
                    )}
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveLevel(level.id)}
                    type="button"
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
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} type="button">
            Guardar Configuración
          </Button>
        </div>
      </div>
    </Modal>
  );
}
