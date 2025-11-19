import { useParams } from "react-router";
import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import SelectLevel from "../../components/Score/SelectLevel";
import ScoreInput from "../../components/Score/ScoreInput";
import ScoreTable from "../../components/Score/ScoreTable";

export default function EditScoreCuts() {
  const { idOlympiad, areaName, areaId, phaseName, phaseId } = useParams<{
    idOlympiad?: string;
    areaName?: string;
    areaId?: string;
    phaseName?: string;
    phaseId?: string;
  }>();

  const decodedAreaName = areaName ? decodeURIComponent(areaName) : "";
  const decodedPhaseName = phaseName ? decodeURIComponent(phaseName) : "";

  const title = `${decodedAreaName} - ${decodedPhaseName}`;

  const olympiadId = Number(idOlympiad) || 1;
  const [scoreCut, setScoreCut] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  useEffect(() => {
    setSelectedLevel(null);
    setScoreCut(null);
  }, [areaId, phaseId]);

  return (
    <>
      <PageMeta
        title={title}
        description={`Editar umbral y nota máxima para el área ${decodedAreaName}, fase ${decodedPhaseName}.`}
      />

      <TitleBreadCrumb pageTitle="Editar nota de clasificación" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          <SelectLevel
            olympiadId={olympiadId}
            areaId={Number(areaId) || 0}
            phaseId={Number(phaseId)}
            areaName={decodedAreaName}
            onSelectLevel={(levelId) => setSelectedLevel(levelId)}
          />

        {selectedLevel && (
            <ScoreInput
              olympiadId={olympiadId}
              areaId={Number(areaId) || 0}
              levelId={selectedLevel}
              phaseId={Number(phaseId)}
              onChangeScoreCut={setScoreCut}
            />
        )}
      </div>

      {selectedLevel && (
        <div className="mt-6">
          <ComponentCard title={`Competidores de ${decodedAreaName}`}>
            <ScoreTable
              olympiadId={olympiadId}
              areaId={Number(areaId) || 0}
              levelId={selectedLevel}
              phaseId={Number(phaseId)}
              scoreCut={scoreCut ?? 0}
            />
          </ComponentCard>
        </div>
      )}
    </>
  );
}
