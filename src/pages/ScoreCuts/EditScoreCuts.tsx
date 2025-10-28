import { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ScoreTable from "../../components/Score/ScoreTable";
import ScoreInput from "../../components/Score/ScoreInput";



export default function EditScoreCuts() {
    const olympiadId = 1;
    const areaId = 2;
    const [scoreCut, setScoreCut] = useState<number | null>(null);

    return (
        <>
            <PageMeta 
              title="Editar Umbral | Oh! SanSi" 
              description="Editar umbral de calificación" />
                <ScoreInput olympiadId={olympiadId} areaId={areaId} onChangeScoreCut={setScoreCut}/>

            <div className="mt-6">
                <ComponentCard title="Competidores de Área">
                    <ScoreTable
                        olympiadId={olympiadId}
                        areaId={areaId}
                        scoreCut={scoreCut ?? 0}
                    />
                </ComponentCard>
            </div>
        </>
    )
}

