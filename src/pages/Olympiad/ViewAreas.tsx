import { useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta"
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb"
import { useEffect, useState } from "react";
import { serviceGetOlympiads } from "../../api/getOlympiad";
import { BoxArea } from "../../components/common/BoxArea";
import { areaService } from "../../api/getAreas";
import ConfigureAreaModal from "../../pages/Olympiad/ConfigureAreaModal";


interface OlympiadData {
    name: string;
    startDate: string;
    endDate: string;
}
interface Area {
    id: number;
    name: string;
}

const ViewAreas = () => {

    const { id } = useParams<{ id: string }>(); // Recupera el parámetro "id" de la URL
    const [olympiadData, setOlympiadData] = useState<OlympiadData>({
        name: "",
        startDate: "",
        endDate: "",
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [areas, setAreas] = useState<Area[]>([]); // Estado para almacenar las áreas
    
    useEffect(() => {
        const fetchOlympiadData = async () => {
            if (id) {
                try {
                    const response = await serviceGetOlympiads.getOlympiadById(Number(id)); // Llama al método de la API
                    setOlympiadData({
                        name: response.name,
                        startDate: response.start_date,
                        endDate: response.end_date,
                    });
                    // Llama al método para obtener las áreas de la olimpiada
                    const areasResponse = await areaService.getAreasByOlympiadId(Number(id));
                    setAreas(areasResponse); // Actualiza el estado con las áreas obtenidas
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
            <TitleBreadCrumb pageTitle={olympiadData.name} /> {/* Aca deberia la consulta de Api solo del nombre de la olimpiada */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {areas.map((area) => (
                    <BoxArea
                        key={area.id}
                        id={area.id}
                        name={area.name} // Pasa el nombre del área
                        startDate={olympiadData.startDate} // Pasa la fecha de inicio de forma estática
                        endDate={olympiadData.endDate} // Pasa la fecha de fin de forma estática
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
