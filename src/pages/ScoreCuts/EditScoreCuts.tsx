import { useParams } from "react-router";
import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import SelectLevel from "../../components/Score/SelectLevel";
import ScoreInput from "../../components/Score/ScoreInput";
import ScoreTable from "../../components/Score/ScoreTable";
import BoxFinishedPhase from "../../components/common/BoxFinishedPhase";
import { getPhaseStatus } from "../../api/services/phaseService";
import { BoxFaseLevel } from "../../components/common/BoxFaseLevel";

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

  const [phaseStatus, setPhaseStatus] = useState<"Activa" | "Terminada" | "Sin empezar" | null>(null);

  useEffect(() => {
    setSelectedLevel(null);
    setScoreCut(null);
  }, [areaId, phaseId]);

  // Obtener el estado de la fase para el nivel seleccionado y bloquear edición si está terminada
  useEffect(() => {
    let alive = true;
    async function loadPhaseStatus() {
      if (selectedLevel == null) {
        if (alive) setPhaseStatus(null);
        return;
      }
      try {
        const res = await getPhaseStatus(olympiadId, Number(areaId), selectedLevel, Number(phaseId));
        if (!alive) return;
        const status = res?.phase_status?.status ?? null;
        setPhaseStatus(status as any);
      } catch (err) {
        console.warn("[ScoreTable] getPhaseStatus error", err);
        if (alive) setPhaseStatus(null);
      }
    }
    void loadPhaseStatus();
    return () => { alive = false; };
  }, [selectedLevel, phaseId, olympiadId, areaId]);


  return (
    <>
      <PageMeta
        title={title}
        description={`Editar umbral y nota máxima para el área ${decodedAreaName}, fase ${decodedPhaseName}.`}
      />

      {selectedLevel && phaseStatus === "Terminada" && (
        <div className="mb-4">
          <BoxFinishedPhase />
        </div>
      )}

      {selectedLevel && phaseStatus === "Sin empezar" && (
        <div className="mb-4">
          <BoxFaseLevel
            title={"Fase no iniciada"}
            message={"Esta fase aún no ha comenzado. Espera a que se habilite para este nivel."}
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr_1fr] gap-6 mt-6">
        <SelectLevel
          olympiadId={olympiadId}
          areaId={Number(areaId) || 0}
          phaseId={Number(phaseId)}
          areaName={decodedAreaName}
          onSelectLevel={(levelId) => setSelectedLevel(levelId)}
        />

        {selectedLevel && phaseStatus !== "Sin empezar" && (
          <ScoreInput
            olympiadId={olympiadId}
            areaId={Number(areaId) || 0}
            levelId={selectedLevel}
            phaseId={Number(phaseId)}
            phaseStatus={phaseStatus}
            onChangeScoreCut={setScoreCut}
          />
        )}
      </div>

      {selectedLevel && phaseStatus !== "Sin empezar" && (
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
