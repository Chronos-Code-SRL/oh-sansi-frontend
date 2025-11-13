
import { BoxOlympiad } from "../common/BoxOlympiad"
import { useEffect, useState } from "react";
import { getOlympiadsByUser } from "../../api/services/olympiadService";
import { OlympiadApi } from "../../types/Olympiad";
import PageMeta from "../common/PageMeta";


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
        <div className="min-h-screen w-full" >
            <div className="absolute inset-0 bg-gradient-to-r from-[#3756A6] via-[#4A4DAF] to-[#E53E3E]">
                <PageMeta title="Oh sansi Olimpiadas" description="Seleccione una olimpiada que desea calificar o gestionar a los competidores." />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="mt-24 mb-2 text-center text-4xl font-semibold text-blue-100">Olimpiadas Oh! Sansi</h1>
                <p className="mb-8 text-center text-muted-foreground text-blue-100">
                    Seleccione una olimpiada que desea calificar o gestionar a los competidores.
                </p>
                {loading && <p className="text-center text-blue-100">Cargando…</p>}
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
            </div>
        </div>
        
        </>
    )
}


export default LadingPage


