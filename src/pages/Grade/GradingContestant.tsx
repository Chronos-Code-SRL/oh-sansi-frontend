import { useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import StudentTable from "../../components/Grade/StudentTable";


export default function MarksStudents() {

    const { idOlympiad, areaName, areaId, phaseId, } = useParams<{ areaName?: string; phaseId?: string; idOlympiad?: string; areaId?: string; }>();
    const title = areaName ? decodeURIComponent(areaName) : "Calificaciones";
    return (
        <>
            <PageMeta
                title={title}
                description={"En esta sección puedes ver y gestionar las calificaciones de los estudiantes."}
            />
            <ComponentCard key={`${areaId}-${phaseId ?? 'none'}`} title={`${title} - Fase ${phaseId}`}>
                <StudentTable
                    key={`${areaId}-${phaseId ?? 'none'}`}
                    idPhase={Number(phaseId)}
                    idOlympiad={Number(idOlympiad)}
                    idArea={Number(areaId)}
                />
            </ComponentCard>
        </>
    )
}

