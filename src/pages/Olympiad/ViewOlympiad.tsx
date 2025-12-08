import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { SimpleBox } from "../../components/common/SimpleBox";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import { Olympiad } from "../../types/Olympiad";
import { getOlympiads, putOlympiadIdActivate } from "../../api/services/olympiadService";

export const ViewOlympiad = () => {

    const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOlympiads = async () => {
            try {
                const response = await getOlympiads();
                const data = response as Olympiad[];
                setOlympiads(data);
            } catch (err) {
                setError("No hay Olimpiadas creadas. Cree una olimpiada por favor");
            } finally {
                setLoading(false);
            }
        };

        fetchOlympiads();
    }, []);

    const refreshOlympiads = async () => {
        const data = await getOlympiads();
        setOlympiads((prev) => {
            const orderMap = new Map(prev.map((o, i) => [o.id, i]));
            return [...data].sort(
                (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
            );
        })
    };

    const handleToggleActive = async (id: number) => {
        try {

            setOlympiads((prev) =>
                prev.map((o) => (o.id === id ? { ...o, status: "Activa" } : o))
            );

            await putOlympiadIdActivate(id);

            await refreshOlympiads();
        } catch (e) {
            await refreshOlympiads();
            setError("No se pudo actualizar el estado. Intenta nuevamente.");
        } finally {
        }
    };
    if (loading) {
        return <p>Cargando olimpiadas...</p>;
    }

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
                        key={olympiad.id}
                        id={olympiad.id}
                        name={olympiad.name}
                        status={olympiad.status}
                        startDate={olympiad.start_date}
                        endDate={olympiad.end_date}
                        areas={olympiad.areas}
                        onToggleActive={handleToggleActive}
                    />
                ))}
            </div>

        </>
    );
}