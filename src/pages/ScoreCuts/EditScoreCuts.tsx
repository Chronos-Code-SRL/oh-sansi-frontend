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
        title={`Editar nota de clasificasión | ${title}`}
        description={`Editar el umbral de calificación para el área ${title}.`}
      />

      <TitleBreadCrumb pageTitle="Editar nota de clasificasión" />

      <div className="mt-6"></div>

      <ComponentCard title={`Seleccionar nivel`}>
        <SelectLevel
        />
      </ComponentCard>

      <div className="mt-6"></div>

      <ComponentCard title={`Gestión de Umbral - ${title}`}>
        <ScoreInput
          olympiadId={olympiadId}
          areaId={Number(areaId) || 0}
          onChangeScoreCut={setScoreCut}
        />
      </ComponentCard>

      <div className="mt-6">
        <ComponentCard title={`Competidores de ${title}`}>
          <ScoreTable
            olympiadId={olympiadId}
            areaId={Number(areaId) || 0}
            scoreCut={scoreCut ?? 0}
          />
        </ComponentCard>
      </div>
    </>
  );
}
