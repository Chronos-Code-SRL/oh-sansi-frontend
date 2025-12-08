import { useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta"
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb"
import { useEffect, useState } from "react";
import { BoxArea } from "../../components/common/BoxArea";
import ConfigureAreaModal from "../../pages/Olympiad/ConfigureAreaModal";
import { Olympiad } from "../../types/Olympiad";
import { getOlympiadById } from "../../api/services/olympiadService";
import { Area } from "../../types/Area";
import { getAreaByOlympiadId } from "../../api/services/areaServices";

const ViewAreas = () => {

    const { id } = useParams<{ id: string }>();
    const [olympiadData, setOlympiadData] = useState<Olympiad | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [areas, setAreas] = useState<Area[]>([]);

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
                    <BoxArea
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
                <ConfigureAreaModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    areaName={selectedArea.name}
                    olympiadId={Number(id)}
                    areaId={selectedArea.id}
                />
            )}
        </>
    )
}

export default ViewAreas
