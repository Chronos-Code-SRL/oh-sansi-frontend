import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { SimpleBox } from "../../components/common/SimpleBox";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import { Olympiad } from "../../types/Olympiad";
import { getOlympiads } from "../../api/services/olympiadService";

export const ViewOlympiad = () => {

    const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
    const [loading, setLoading] = useState(true); // Estado para manejar la carga
    const [error, setError] = useState<string | null>(null); // Estado para manejar errores

    // Efecto para obtener los datos al montar el componente
    useEffect(() => {
        const fetchOlympiads = async () => {
            try {
                //const response = await serviceGetOlympiads.getOlympiads(); // Llamamos a la API
                const response = await getOlympiads();
                const data = response as Olympiad[]; // Aseguramos el tipo de data
                setOlympiads(data); // Guardamos las olimpiadas en el estado
            } catch (err) {
                setError("No hay Olimpiadas creadas. Cree una olimpiada por favor");
            } finally {
                setLoading(false); // Terminamos el estado de carga
            }
        };

        fetchOlympiads();
    }, []);
    // Mostrar un mensaje de carga mientras se obtienen los datos
    if (loading) {
        return <p>Cargando olimpiadas...</p>;
    }

    // Mostrar un mensaje de error si la solicitud falla
    if (error) {
        return <p>{error}</p>;
    }
    return (
        <>
            <PageMeta
                title="Gestionar Olimpiadas"
                description="Página para gestionar las olimpiadas."
            />

            <TitleBreadCrumb pageTitle="Configurar Áreas" />
            <p className="text-sm text-gray-500 mb-4">
                Selecciona una olimpiada para configurar sus áreas respectivas
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {olympiads.map((olympiad) => (
                    <SimpleBox
                        key={olympiad.id} // Clave única para cada elemento
                        id={olympiad.id} // Pasamos el ID de la olimpiada
                        name={olympiad.name} // Pasamos el nombre de la olimpiada
                        status={olympiad.status} // Pasamos el estado
                        startDate={olympiad.start_date} // Pasamos la fecha de inicio
                        endDate={olympiad.end_date} // Pasamos la fecha de fin
                        areas={olympiad.areas} // Pasamos las áreas
                    />
                ))}
            </div>

        </>
    );
}