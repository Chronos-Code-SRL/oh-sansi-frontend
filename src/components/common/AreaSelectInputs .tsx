import { useEffect, useState } from "react";
import MultiSelect from "../form/MultiSelect";
import { Area } from "../../types/Area";
import { getAreas } from "../../api/services/areaServices";

interface AreaSelectInputsProps {
    onChange: (values: string[]) => void;
    error?: string;
    initialSelected?: string[];
    valueType?: 'id' | 'name';
}

export default function AreaSelectInputs({ onChange, error, initialSelected = [], valueType = 'id' }: AreaSelectInputsProps) {
    const [selectedValues, setSelectedValues] = useState<string[]>(initialSelected);
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await getAreas();
                setAreas(response);
            } catch (error) {
                console.error("Error al obtener áreas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAreas();
    }, []);

    const multiOptions = areas.map((area) => ({
        value: String(area.id),
        text: area.name,
        selected: selectedValues.includes(String(area.id)),
    }));

    if (loading) {
        return <p>Cargando áreas...</p>;
    }
    if (multiOptions.length === 0) {
        return <p>No hay áreas disponibles.</p>;
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
                            return found?.name ?? v;
                        }).filter(Boolean))) as string[]
                        : values;
                    onChange(outputValues);
                }}
                disabled={multiOptions.length === 0}
            />
            {error && (
                <p className="mt-1.5 text-xs text-error-500">{error}</p>
            )}
        </div>
    );
}