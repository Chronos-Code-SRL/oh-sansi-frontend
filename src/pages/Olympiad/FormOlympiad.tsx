import PageMeta from "../../components/common/PageMeta";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import AdminDefaultInputs from "../../components/form/form-elements/AdminDefaultInputs";

export default function FormOlympiad() {
    return (
        <>
            <PageMeta
                title="Formulario Olimpiada"
                description="Formulario para crear una nueva olimpiada"
            />

            < TitleBreadCrumb pageTitle="Crear nueva olimpiada" />

            <div className="flex justify-center">
                <div className="w-full max-w-5xl space-y-6">
                    <AdminDefaultInputs />
                </div>
            </div>
        </>
    )
}

