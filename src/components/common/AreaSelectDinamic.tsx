import { useEffect, useState } from "react";
import MultiSelect from "../form/MultiSelect";
import { Area } from "../../types/Area";
import { getAreaByOlympiadId } from "../../api/services/areaServices";

interface AreaSelectInputsProps {
    onChange: (values: string[]) => void;
    error?: string;
    initialSelected?: string[];
    valueType?: "id" | "name";
    olympiadId: number;
}

export default function AreaSelectDinamic({
    onChange,
    error,
    initialSelected = [],
    valueType = "id",
    olympiadId
}: AreaSelectInputsProps) {

    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);

    const [msKey, setMsKey] = useState(0);

    useEffect(() => {
        setSelectedValues(initialSelected);
        setMsKey(prev => prev + 1); 
    }, [initialSelected, olympiadId]);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await getAreaByOlympiadId(olympiadId);
                setAreas(response);
            } catch (error) {
                console.error("Error al obtener áreas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAreas();
    }, [olympiadId]);

    const multiOptions = areas.map(area => ({
        value: String(area.id),
        text: area.name,
        selected: selectedValues.includes(String(area.id))
    }));

    if (loading) return <p>Cargando áreas...</p>;

    return (
        <div className="space-y-2">
            <MultiSelect
                key={msKey}  
                label="Seleccionar Área(s)"
                options={multiOptions}
                defaultSelected={initialSelected}
                onChange={(values) => {
                    setSelectedValues(values);

                    const output =
                        valueType === "name"
                            ? values.map(v =>
                                  areas.find(a => String(a.id) === v)?.name || v
                              )
                            : values;

                    onChange(output);
                }}
                disabled={multiOptions.length === 0}
            />

            {error && (
                <p className="text-xs text-error-500">{error}</p>
            )}
        </div>
    );
}