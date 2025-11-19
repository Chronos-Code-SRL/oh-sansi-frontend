import { useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import AwardedCompetitorsTable from "../../components/tables/AwardedCompetitorsTable";


export default function AwardedList() {

    const { idOlympiad, areaName, areaId} = useParams<{
    idOlympiad?: string;
    areaName?: string;
    areaId?: string;
  }>();
    const decodedAreaName = areaName ? decodeURIComponent(areaName) : "";
    const title = `${decodedAreaName}`;

    return (
        <>
            <PageMeta
                title={title}
                description={"En esta sección puedes ver a los estudiantes premiados."}
            />
            <ComponentCard key={`${areaId}`} title={title}>
                <AwardedCompetitorsTable
                    key={`${areaId}`}
                    idOlympiad={Number(idOlympiad)}
                    idArea={Number(areaId)}
                />
            </ComponentCard>
        </>
    )
}
