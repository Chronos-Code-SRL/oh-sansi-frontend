import { useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import RankedCompetitorsTable from "../../components/tables/RankedCompetitorsTable";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";


export default function RankedContestantsList() {

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
                description={"En esta sección puedes ver las calificaciones de los estudiantes."}
            />
            < TitleBreadCrumb pageTitle="Lista de fase clasificación" />
            <ComponentCard key={`${areaId}-${phaseId ?? 'none'}`} title={title}>
                <RankedCompetitorsTable
                    key={`${areaId}-${phaseId ?? 'none'}`}
                    idPhase={Number(phaseId)}
                    idOlympiad={Number(idOlympiad)}
                    idArea={Number(areaId)}
                />
            </ComponentCard>
        </>
    )
}

