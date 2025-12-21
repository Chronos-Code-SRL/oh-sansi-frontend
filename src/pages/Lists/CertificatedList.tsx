import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CertificatedTable from "../../components/tables/CertificatedTable";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";

export default function CertificateList() {
  return (
    <>
      <PageMeta
        title="Lista para generación de Certificados"
        description={"Estudiantes elegibles para certificados."}
      />
      < TitleBreadCrumb pageTitle="Lista para generación de Certificados" />
      <ComponentCard title="Estudiantes seleccionados para la generación de certificados">
        <CertificatedTable/>
      </ComponentCard>
    </>
  );
}
