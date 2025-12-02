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
    const [availableAreas, setAvailableAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);

    const [msKey, setMsKey] = useState(0);

    useEffect(() => {
        if (initialSelected.length === 0) {
            setSelectedValues([]);
        } else {
            setSelectedValues(initialSelected);
        }
        setMsKey(prev => prev + 1);
    }, [initialSelected, olympiadId]);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await getAreaByOlympiadId(olympiadId);
                setAreas(response);
                const disponibles = response.filter(
                    (area: Area) => !initialSelected.includes(String(area.id))
                );
                setAvailableAreas(disponibles);
            } catch (error) {
                console.error("Error al obtener áreas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAreas();
    }, [olympiadId, initialSelected]);


    const multiOptions = availableAreas.map(area => ({
        value: String(area.id),
        text: area.name,
        selected: selectedValues.includes(String(area.id))
    }));

    if (loading) return <p>Cargando áreas...</p>;

    return (
        <div className="space-y-2">

            {initialSelected.length > 0 && (
                <div>
                    <p className="text-sm font-medium mb-1">Áreas registradas:</p>

                    <div className="flex flex-wrap gap-2">
                        {initialSelected.map(id => {
                            const area = areas.find(a => String(a.id) === id);

                            return (
                                <span
                                    key={id}
                                    className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                                >
                                    {area?.name ?? "Área registrada"}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            <MultiSelect
                key={msKey}
                label="Añadir nuevas Área(s):"
                options={multiOptions}
                defaultSelected={[]}
                onChange={(values) => {
                    setSelectedValues(values);

                    const output =
                        valueType === "name"
                            ? values.map(v =>
                                  availableAreas.find(a => String(a.id) === v)?.name || v
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