
import { BoxOlympiad } from "../common/BoxOlympiad"
import { useEffect, useState } from "react";
import { getOlympiadsByUser } from "../../api/services/olympiadService";
import { OlympiadApi } from "../../types/Olympiad";
import PageMeta from "../common/PageMeta";


const LadingPage = () => {
    const [data, setData] = useState<OlympiadApi[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOlympiads = async () => {
            setLoading(true);
            try {
                const response = await getOlympiadsByUser();
                const data = response as OlympiadApi[];
                setData(data);
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

                        <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {loading && (
                                <div className="col-span-full text-center text-blue-100 py-12">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                                    <p className="mt-2">Cargando olimpiadas…</p>
                                </div>
                            )}

                            {error && (
                                <div className="col-span-full text-center text-red-300 py-12 bg-red-500/10 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {!loading && !error && data.map((o) => (
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
                    </div>
                </div>
            </div>

        </>
    )
}


export default LadingPage


