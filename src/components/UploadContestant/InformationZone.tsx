import { getCsvHeaderTemplate } from "../../api/services/uploadContestantService";
import Alert from "../ui/alert/Alert";

export default function InformationZone() {


    const downloadHeadersCsv = async () => {
        try {
          const blob = await getCsvHeaderTemplate();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "Plantilla para Competidores.csv";
          a.click();
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Error al descargar archivo CSV", error);
        }
      };

    return (
        <div>
            <Alert
                variant="info"
                title="Formato requerido"
                message="El archivo CSV debe contener las cabeceras adecuadas, descargue la plantilla para asegurarse que los datos de los competidores estén completos."
                showLink={true}
                onLinkClick={() => downloadHeadersCsv()}
                linkText="Descargar plantilla"
            />
        </div>
    )
}

