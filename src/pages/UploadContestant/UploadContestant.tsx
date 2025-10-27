import PageMeta from "../../components/common/PageMeta";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import ContestantZone from "../../components/UploadContestant/ContestantZone";

export default function UploadContestant() {
  return (
    <>
      <div>
        <PageMeta
          title="Registro de Competidores"
          description="Registro masivo de competidores para las Olimpiadas"
        />
        < TitleBreadCrumb pageTitle="Registrar Competidores" />
        <ContestantZone/>

      </div>
    </>
  );
}
