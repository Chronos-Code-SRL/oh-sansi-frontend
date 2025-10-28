import { useState } from "react";
import { useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ScoreTable from "../../components/Score/ScoreTable";
import ScoreInput from "../../components/Score/ScoreInput";



export default function EditScoreCuts() {
  const { areaName, areaId } = useParams<{ areaName?: string; areaId?: string }>();
  const olympiadId = 1; // luego puede venir dinámico también
  const [scoreCut, setScoreCut] = useState<number | null>(null);

  function capitalizeFirst(str: string) {
    const s = str.trim();
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  const title = areaName ? capitalizeFirst(decodeURIComponent(areaName)) : "Área";

    return (
        <>
            <PageMeta 
              title={`Editar Umbral | ${title}`}
              description="Editar umbral de calificación" />
                <ScoreInput olympiadId={olympiadId} areaId={Number(areaId) || 0} onChangeScoreCut={setScoreCut}/>

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
    )
}

