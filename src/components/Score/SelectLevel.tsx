import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { levelService } from "../../api/services/levelService";
import { Level } from "../../types/Level";

interface LevelOption {
  value: string;
  label: string;
}

interface SelectLevelProps {
  olympiadId: number;
  areaId: number;
  onSelectLevel?: (levelId: number) => void;
}

export default function SelectLevel({ olympiadId, areaId, onSelectLevel }: SelectLevelProps) {
  const [levels, setLevels] = useState<LevelOption[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [confirmModal, setConfirmModal] = useState(false);

useEffect(() => {
  const fetchLevels = async () => {
    try {
      const response = await levelService.getLevelsByArea(olympiadId, areaId);

      const levelList: Level[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.levels)
        ? response.levels
        : [];

      if (!levelList.length) {
      }

      const formattedLevels = levelList.map((lvl) => ({
        value: String(lvl.id),
        label: lvl.name,
      }));

      setLevels(formattedLevels);
    } catch (error) {
      console.error("Error al obtener los niveles del área:", error);
    }
  };

  fetchLevels();
}, [olympiadId, areaId]);



  const handleSelectChange = (value: string) => {
    setSelectedLevel(value);
    setConfirmModal(true);
    onSelectLevel?.(Number(value));
  };

  return (
    <>
      <ComponentCard title="Niveles del Área">
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
          <Label htmlFor="level">Seleccione un nivel:</Label>

          <Select
            options={levels}
            placeholder="Seleccione un nivel"
            value={selectedLevel}
            onChange={handleSelectChange}
          />

          {selectedLevel && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Nivel seleccionado: <strong>{selectedLevel}</strong>
            </p>
          )}
        </div>
      </ComponentCard>

      <Modal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        className="max-w-md mx-auto shadow-lg"
      >
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Nivel seleccionado correctamente
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Has seleccionado el nivel con ID: <strong>{selectedLevel}</strong>
          </p>
          <Button
            className="w-full mt-4"
            variant="primary"
            onClick={() => setConfirmModal(false)}
          >
            Aceptar
          </Button>
        </div>
      </Modal>
    </>
  );
}
