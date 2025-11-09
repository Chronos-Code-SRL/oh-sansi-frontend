import { useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import StudentTable from "../../components/Grade/StudentTable";


export default function MarksStudents() {

    const { idOlympiad, areaName, areaId, phaseId, phaseName } = useParams<{
    idOlympiad?: string;
    areaName?: string;
    areaId?: string;
    phaseId?: string;
    phaseName?: string;
  }>();
    const decodedPhaseName = phaseName ? decodeURIComponent(phaseName) : "";
    const decodedAreaName = areaName ? decodeURIComponent(areaName) : "";
    const title = `${decodedAreaName} - ${decodedPhaseName}`;

    return (
        <>
            <PageMeta
                title={title}
                description={"En esta sección puedes ver y gestionar las calificaciones de los estudiantes."}
            />
            <ComponentCard key={`${areaId}-${phaseId ?? 'none'}`} title={title}>
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

