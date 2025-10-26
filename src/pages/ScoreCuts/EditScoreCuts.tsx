import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ScoreTable from "../../components/Score/ScoreTable";
import ScoreInput from "../../components/Score/ScoreInput";



export default function EditScoreCuts() {
    return (
        <>
            <PageMeta 
              title="Editar Umbral | Oh! SanSi" 
              description="Editar umbral de calificación" />
                <ScoreInput />

            <ComponentCard title="Materia Fase tal 2">
                <ScoreTable />
            </ComponentCard>

        </>
    )
}

