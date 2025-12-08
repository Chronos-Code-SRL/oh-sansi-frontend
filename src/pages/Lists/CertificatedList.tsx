import { useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CertificatedTable from "../../components/tables/CertificatedTable";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";

export default function CertificateList() {
  const { idOlympiad, areaName, areaId } = useParams<{
    idOlympiad?: string;
    areaName?: string;
    areaId?: string;
  }>();

  const decodedAreaName = areaName ? decodeURIComponent(areaName) : "";
  const title = `${decodedAreaName} - Certificados`;

  return (
    <>
      <PageMeta
        title={title}
        description={"Estudiantes elegibles para certificados."}
      />
      < TitleBreadCrumb pageTitle="Lista para generación de Certificados" />
      <ComponentCard key={`${areaId}`} title={title}>
        <CertificatedTable
          key={`${areaId}`}
          idOlympiad={Number(idOlympiad)}
          idArea={Number(areaId)}
        />
      </ComponentCard>
    </>
  );
}
