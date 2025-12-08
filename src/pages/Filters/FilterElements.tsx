
import { useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import { FilterBar } from "../../components/filter/FilterBar";

export default function FormElements() {
  const { olympiadId } = useParams();
  return (
    <div>
      <PageMeta
        title="Filtros para lista de competidores"
        description="Distintos filtros para la lista de competidores"
      />
      <TitleBreadCrumb pageTitle="Filtrar Lista de Competidores" />

      <div className="flex justify-center">
        <div className="w-full max-w-7xl space-y-3">
          <FilterBar olympiadId={Number(olympiadId)} />
        </div>
      </div>
    </div>
  );
}
