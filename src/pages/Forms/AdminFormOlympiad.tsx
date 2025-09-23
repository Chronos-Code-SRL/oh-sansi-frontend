//import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import SelectInputs from "../../components/form/form-elements/SelectInputs";
import PageMeta from "../../components/common/PageMeta";
import AdminDefaultInputs from "../../components/form/form-elements/AdminDefaultInputs";
import AdminPageBreadCrumb from "../../components/common/AdminPageBreadCrumb";

export default function FormElements() {
    return (
        <div>
            <PageMeta
                title="Creacion de olimpiada"
                description="Con este formulario podras crear una nueva olimpiada"
            />
            {/* <PageBreadcrumb pageTitle="Crear nueva olimpiada" /> */}
            < AdminPageBreadCrumb pageTitle="Crear nueva olimpiada" />

            <div className="flex justify-center">
                <div className="w-full max-w-2xl space-y-6">
                    <AdminDefaultInputs />
                    <SelectInputs />
                </div>
            </div>
        </div>
    );
}
