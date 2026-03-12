import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import { levelService } from "../../api/services/levelService";
import { Level } from "../../types/Level";

interface LevelOption {
  value: string;
  label: string;
}

interface SelectLevelProps {
  olympiadId: number;
  areaId: number;
  phaseId?: number;
  areaName?: string;
  onSelectLevel?: (levelId: number) => void;
}

export default function SelectLevel({
  olympiadId,
  areaId,
  phaseId,
  areaName,
  onSelectLevel,
}: SelectLevelProps) {
  const [levels, setLevels] = useState<LevelOption[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [_selectedLabel, setSelectedLabel] = useState<string>("");
  const [_confirmModal, setConfirmModal] = useState(false);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await levelService.getLevelsByArea(olympiadId, areaId);

        const levelList: Level[] = Array.isArray(response)
          ? response
          : Array.isArray(response?.levels)
          ? response.levels
          : [];

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

  useEffect(() => {
    setSelectedLevel("");
    setSelectedLabel("");
  }, [areaId, olympiadId, phaseId]);

  const handleSelectChange = (value: string) => {
    const selected = levels.find((lvl) => lvl.value === value);
    setSelectedLevel(value);
    setSelectedLabel(selected?.label || "");
    setConfirmModal(true);
    onSelectLevel?.(Number(value));
  };

  return (
    <>
      <ComponentCard title={`Niveles del Área ${areaName ? `– ${areaName}` : ""}`}>
        <div className="flex flex-col gap-4 w-full mx-auto">
          <Label htmlFor="level">Seleccione un nivel:</Label>

          <Select
            options={levels}
            placeholder="Seleccione un nivel"
            value={selectedLevel}
            onChange={handleSelectChange}
          />
        </div>
      </ComponentCard>
    </>
  );
}