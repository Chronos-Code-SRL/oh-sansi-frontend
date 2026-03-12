import ComponentCard from "../../components/common/ComponentCard";
import AwardedCompetitorsTable from "../../components/tables/AwardedCompetitorsTable";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";

export default function AwardedList() {
    return (
        <>
            <TitleBreadCrumb pageTitle="Lista de premiados" />

            <ComponentCard title="Podio de Concursantes premiados">
                <AwardedCompetitorsTable />
            </ComponentCard>

        </>
    )
}