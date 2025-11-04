
import { BoxOlympiad } from "../../components/common/BoxOlympiad"
import { useEffect, useState } from "react";
import { getOlympiadsByUser } from "../../api/services/olympiadService";
import { OlympiadApi } from "../../types/Olympiad";


const LadingPage = () => {
    const [data, setData] = useState<OlympiadApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOlympiads = async () => {
            try {
                const response = await getOlympiadsByUser();
                const data = response as OlympiadApi[]; // Aseguramos el tipo de data
                setData(data); // Guardamos las olimpiadas en el estado
                console.log(data);
            } catch (err) {
                setError("No hay Olimpiadas creadas. Cree una olimpiada por favor");
            } finally {
                setLoading(false);
            }
        };
        fetchOlympiads();
    }, []);
    return (
        <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="mt-6 mb-2 text-center text-4xl font-semibold">Oh sansi Olimpiadas</h1>
                <p className="mb-8 text-center text-muted-foreground">
                    Seleccione una olimpiada que desea calificar o gestionar a los competidores.
                </p>
                {loading && <p className="text-center">Cargando…</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                {!loading && !error && (
                    <div className="grid  auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {data.map((o) => (
                            <BoxOlympiad
                                key={o.id}
                                id={o.id}
                                name={o.name}
                                status={o.status}
                                startDate={o.start_date}
                                endDate={o.end_date}
                                areas={(o.areas ?? []).map((a: any) => a.name)}
                            />
                        ))}
                    </div>
                )}
            </div>

        </>
    )
}


export default LadingPage


