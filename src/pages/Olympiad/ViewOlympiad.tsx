import PageMeta from "../../components/common/PageMeta";
import { SimpleBox } from "../../components/common/SimpleBox";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";



export const ViewOlympiad = () => {
    return (
        <>
            <PageMeta
                title="Gestionar Olimpiadas"
                description="Página para gestionar las olimpiadas."
            />

            <TitleBreadCrumb pageTitle="Gestionar Olimpiadas" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SimpleBox />
                <SimpleBox />
                <SimpleBox />
                <SimpleBox />
                <SimpleBox />
                <SimpleBox />
            </div>

        </>
    );
}