import { useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta"
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb"
import { useEffect, useState } from "react";
import { serviceGetOlympiads } from "../../api/getOlympiad";


const ViewAreas = () => {

    const { id } = useParams<{ id: string }>(); // Recupera el parámetro "id" de la URL
    const [olympiadName, setOlympiadName] = useState<string>(""); // Estado para almacenar el nombre de la olimpiada

    useEffect(() => {
        const fetchOlympiadName = async () => {
            if (id) {
                try {
                    const name = await serviceGetOlympiads.getOlympiadById(Number(id)); // Llama al método de la API
                    setOlympiadName(name); // Actualiza el estado con el nombre
                } catch (error) {
                    console.error("Error al obtener el nombre de la olimpiada:", error);
                }
            }
        };

        fetchOlympiadName();
    }, [id]);
    return (
        <>
            <PageMeta
                title="Ver áreas de Olimpiada"
                description="Página para ver las áreas de la olimpiada."
            />
            <TitleBreadCrumb pageTitle={olympiadName} /> {/* Aca deberia la consulta de Api solo del nombre de la olimpiada */}
        </>
    )
}

export default ViewAreas
