import { useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta"
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb"
import { useEffect, useState } from "react";
import { BoxArea } from "../../components/common/BoxArea";
//import { areaService } from "../../api/getAreas";
import ConfigureAreaModal from "../../pages/Olympiad/ConfigureAreaModal";
import { Olympiad } from "../../types/Olympiad";
import { getOlympiadById } from "../../services/olympiadService";
import { Area } from "../../types/Area";
import { getAreaByOlympiadId } from "../../services/areaServices";

const ViewAreas = () => {

    const { id } = useParams<{ id: string }>(); // Recupera el parámetro "id" de la URL
    const [olympiadData, setOlympiadData] = useState<Olympiad | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [areas, setAreas] = useState<Area[]>([]); // Estado para almacenar las áreas

    useEffect(() => {
        const fetchOlympiadData = async () => {
            if (id) {
                try {
                    const response = await getOlympiadById(Number(id)); // Llama al método de la API
                    setOlympiadData(response); // Actualiza el estado con los datos de la olimpiada
                    // Llama al método para obtener las áreas de la olimpiada
                    const areas = await getAreaByOlympiadId(Number(id));
                    setAreas(areas); // Actualiza el estado con las áreas obtenidas
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
            <TitleBreadCrumb pageTitle={olympiadData?.name || "Cargando..."} /> {/* Aca deberia la consulta de Api solo del nombre de la olimpiada */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {areas.map((area) => (
                    <BoxArea
                        key={area.id}
                        id={area.id}
                        name={area.name} // Pasa el nombre del área
                        startDate={olympiadData?.start_date || ""} // Pasa la fecha de inicio de forma estática
                        endDate={olympiadData?.end_date || ""} // Pasa la fecha de fin de forma estática
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
