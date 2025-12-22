import { useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta"
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb"
import { useEffect, useState } from "react";
import { Olympiad } from "../../types/Olympiad";
import { getOlympiadById } from "../../api/services/olympiadService";
import { Area } from "../../types/Area";
import { getAreaByOlympiadId } from "../../api/services/areaServices";
import ConfigureMedalModal from "./ConfigureMedalModal";
import Alert from "../../components/ui/alert/Alert";
import { BoxAreaMedal } from "../../components/common/BoxAreaMedal";


const ViewAreasMedal = () => {

    const { id } = useParams<{ id: string }>();
    const [olympiadData, setOlympiadData] = useState<Olympiad | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [areas, setAreas] = useState<Area[]>([]);

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle, setAlertTitle] = useState<string>("");
    const [alertMessage, setAlertMessage] = useState<string>("");
    const [alertVariant, setAlertVariant] = useState<"success" | "error" | "warning" | "info">("success");
    const [alertTimer, setAlertTimer] = useState<number | null>(null);

    function showAlert(title: string, message: string, variant: "success" | "error" | "warning" | "info" = "success") {
        if (alertTimer !== null) {
            window.clearTimeout(alertTimer);
            setAlertTimer(null);
        }
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVariant(variant);
        setAlertOpen(true);
        const t = window.setTimeout(() => {
            setAlertOpen(false);
            setAlertTimer(null);
        }, 4000);
        setAlertTimer(t);
    }

    useEffect(() => {
        const fetchOlympiadData = async () => {
            if (id) {
                try {
                    const response = await getOlympiadById(Number(id));
                    setOlympiadData(response);
                    const areas = await getAreaByOlympiadId(Number(id));
                    setAreas(areas);
                } catch (error) {
                    console.error("Error al obtener los datos de la olimpiada:", error);
                }
            }
        };

        fetchOlympiadData();
    }, [id]);

    return (
        <>
            <PageMeta
                title="Ver áreas de Olimpiada"
                description="Página para ver las áreas de la olimpiada."
            />
            <TitleBreadCrumb pageTitle={olympiadData?.name || "Cargando..."} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {areas.map((area) => (
                    <BoxAreaMedal
                        key={area.id}
                        id={area.id}
                        name={area.name}
                        startDate={olympiadData?.start_date || ""}
                        endDate={olympiadData?.end_date || ""}
                        onConfigureClick={() => {
                            setSelectedArea(area);
                            setIsModalOpen(true);
                        }}
                    />
                ))}
            </div>

            {selectedArea && (
                <ConfigureMedalModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    areaName={selectedArea.name}
                    olympiadId={Number(id)}
                    areaId={selectedArea.id}
                    onSuccess={(fb) => {
                        showAlert(
                            fb?.title ?? "Medallero guardado",
                            fb?.message ?? "Los cambios se guardaron correctamente.",
                            fb?.variant ?? "success",
                        );
                    }}
                />
            )}

            {alertOpen && (
                <div
                    className="fixed bottom-6 right-6 z-[1000] w-[360px] max-w-[92vw] pointer-events-none"
                    role="presentation"
                >
                    <div className="pointer-events-auto" role="alert" aria-live="polite">
                        <Alert
                            variant={alertVariant}
                            title={alertTitle}
                            message={alertMessage}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default ViewAreasMedal
