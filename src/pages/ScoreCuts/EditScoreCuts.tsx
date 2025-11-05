import { useState } from "react";
import { useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import ScoreTable from "../../components/Score/ScoreTable";
import ScoreInput from "../../components/Score/ScoreInput";
import SelectLevel from "../../components/Score/SelectLevel";

export default function EditScoreCuts() {
  const { areaName = "", areaId = "0", idOlympiad = "1" } = useParams<{
    areaName?: string;
    areaId?: string;
    idOlympiad?: string;
  }>();

  const olympiadId = Number(idOlympiad) || 1;
  const [scoreCut, setScoreCut] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  function capitalizeFirst(str: string) {
    const s = str.trim();
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  const title = areaName
    ? capitalizeFirst(decodeURIComponent(areaName))
    : "Área";

  return (
    <>
      <PageMeta
        title={`Editar nota de clasificación | ${title}`}
        description={`Editar el umbral de calificación para el área ${title}.`}
      />

      <TitleBreadCrumb pageTitle="Editar nota de clasificación" />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentCard title="Seleccionar nivel">
          <SelectLevel
            olympiadId={olympiadId}
            areaId={Number(areaId) || 0}
            onSelectLevel={(levelId) => setSelectedLevel(levelId)}
          />
        </ComponentCard>

        {selectedLevel && (
          <ComponentCard title={`Gestión Clasificación - ${title}`}>
            <ScoreInput
              olympiadId={olympiadId}
              areaId={Number(areaId) || 0}
              levelId={selectedLevel}
              onChangeScoreCut={setScoreCut}
            />
          </ComponentCard>
        )}
      </div>

      {selectedLevel && (
        <div className="mt-6">
          <ComponentCard title={`Competidores de ${title}`}>
            <ScoreTable
              olympiadId={olympiadId}
              areaId={Number(areaId) || 0}
              levelId={selectedLevel}
              scoreCut={scoreCut ?? 0}
            />
          </ComponentCard>
        </div>
      )}
    </>
  );
}
