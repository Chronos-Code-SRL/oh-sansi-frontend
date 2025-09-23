import PageMeta from "../../components/common/PageMeta";
import AdminDefaultInputs from "../../components/form/form-elements/AdminDefaultInputs";
import AdminPageBreadCrumb from "../../components/common/AdminPageBreadCrumb";

export default function AdminFormOlympiad() {
    return (
        <>
            {/*Componente que solo pone nombre a la ruta en que estamos*/}
            <PageMeta
                title="Creacion de olimpiada"
                description="Con este formulario podras crear una nueva olimpiada"
            />

            {/*Componente que da estilos al titulo y le pasa un parametro*/}
            < AdminPageBreadCrumb pageTitle="Crear nueva olimpiada" />

            <div className="flex justify-center">
                
                <div className="w-full max-w-5xl space-y-6">
                    <AdminDefaultInputs />
                    {/* <AdminSelectInputs /> */} 
                </div>
            </div>
        </>
    );
}
