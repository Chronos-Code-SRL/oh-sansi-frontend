import ComponentCard from "../../components/common/ComponentCard";
import AwardedCompetitorsTable from "../../components/tables/AwardedCompetitorsTable";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";

export default function AwardedList() {
    return (
        <>
            <TitleBreadCrumb pageTitle="Medallero" />

            <ComponentCard title="Gestión de Medallas">
                <AwardedCompetitorsTable />
            </ComponentCard>

        </>
    )
}