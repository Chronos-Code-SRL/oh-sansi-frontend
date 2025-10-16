import { useEffect, useState } from "react";
import MultiSelect from "../MultiSelect";
import { areaService } from "../../../api/getAreas";

// Tipado de un área según lo esperado del backend
interface Area {
    id: number | string;
    name: string;
}

interface AreaSelectInputsProps {
    onChange: (values: string[]) => void; // devolverá ids o nombres según valueType
    error?: string; // mensaje de error a mostrar (validación externa)
    initialSelected?: string[]; // para edición futura
    valueType?: 'id' | 'name'; // por defecto 'id'
}

export default function AreaSelectInputs({ onChange, error, initialSelected = [], valueType = 'id' }: AreaSelectInputsProps) {
    const [selectedValues, setSelectedValues] = useState<string[]>(initialSelected);
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await areaService.getAreas();
                // response es un AxiosResponse; normalizamos varias posibles formas
                // Esperadas: data.areas (array) o data.data (array) o data (array)
                const raw = ((): unknown => {
                    const d: any = response?.data;
                    if (Array.isArray(d)) return d; // si el backend devuelve directamente un array
                    if (Array.isArray(d?.areas)) return d.areas;
                    if (Array.isArray(d?.data)) return d.data;
                    return [];
                })();

                const parsed: Area[] = (raw as any[]).map((item, idx) => ({
                    id: item.id ?? idx,
                    name: item.name ?? item.nombre ?? `Área ${idx + 1}`,
                }));
                setAreas(parsed);
            } catch (error) {
                console.error("Error fetching areas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAreas();
    }, []);

    // Adaptar al formato del MultiSelect
    const multiOptions = areas.map((area) => ({
        value: String(area.id),
        text: area.name,
        selected: selectedValues.includes(String(area.id)),
    }));

    if (loading) {
        return <p>Cargando áreas...</p>;
    }
    return (
        <div className="space-y-2">
            <MultiSelect
                label="Seleccionar Área(s)"
                options={multiOptions}
                defaultSelected={initialSelected}
                onChange={(values) => {
                    setSelectedValues(values);
                    const outputValues = valueType === 'name'
                        ? Array.from(new Set(values.map(v => {
                            const found = areas.find(a => String(a.id) === v);
                            return found?.name ?? v; // fallback al id si no encuentra
                        }).filter(Boolean))) as string[]
                        : values;
                    // Debug opcional
                    console.log('[AdminSelectInputs] Selección cruda IDs:', values, ' -> salida:', outputValues, 'valueType:', valueType);
                    onChange(outputValues); // levantamos el cambio al padre
                }}
                disabled={multiOptions.length === 0}
            />
            {multiOptions.length === 0 && (
                <p className="mt-1 text-xs text-gray-500">No hay áreas disponibles.</p>
            )}
            {error && (
                <p className="mt-1.5 text-xs text-error-500">{error}</p>
            )}
        </div>
    );
}
