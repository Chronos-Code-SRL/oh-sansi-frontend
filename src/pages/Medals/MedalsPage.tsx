import ComponentCard from "../../components/common/ComponentCard";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import MedalTable from "../../components/medals/medalTable";


export default function MedalsPage() {
    return (
        <>
            <TitleBreadCrumb pageTitle="Medallero" />

            <ComponentCard title="Gestión de Medallas">
                <MedalTable />

            </ComponentCard>

        </>
    )
}
