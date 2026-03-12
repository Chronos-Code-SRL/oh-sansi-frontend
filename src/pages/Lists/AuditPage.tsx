
import PageMeta from "../../components/common/PageMeta";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import { AuditLogsTable } from "../../components/tables/AuditLogsTable";

export default function AuditPage() {

  return (
    <div>
      <PageMeta
        title="Historial de Cambios"
        description="Se muestran los cambios realizados en la edicion de notas de los competidores"
      />
      <TitleBreadCrumb pageTitle="Historial de Cambios" />

      <div className="flex justify-center">
        <div className="w-full max-w-7xl space-y-3">
          <AuditLogsTable/>
        </div>
      </div>
    </div>
  );
}