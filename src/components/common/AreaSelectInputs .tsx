import { useEffect, useState } from "react";
import MultiSelect from "../form/MultiSelect";
import { Area } from "../../types/Area";
import { getAreas } from "../../api/services/areaServices"; // Importar la función desde areaServices


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

    //Actualiza la selección automática de las areas de un usuario
    useEffect(() => {
        if (
            initialSelected.length > 0 &&
            JSON.stringify(initialSelected) !== JSON.stringify(selectedValues)
        ) {
            setSelectedValues(initialSelected);
        }
    }, [initialSelected]);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await getAreas();
                console.log("Áreas obtenidas:", response);
                setAreas(response);
            } catch (error) {
                console.error("Error al obtener áreas:", error);
            } finally {
                setLoading(false);
                console.log("Estado de carga actualizado:", loading);
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
    if (multiOptions.length === 0) {
        return <p>No hay áreas disponibles.</p>;
    }
    return (
        <div className="space-y-2">
            <MultiSelect
                key={selectedValues.join("-")} //para el montaje de areas registradas de un usuario
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
            {error && (
                <p className="mt-1.5 text-xs text-error-500">{error}</p>
            )}
            {/* {multiOptions.length === 0 && (
                <p className="mt-1 text-xs text-gray-500">No hay áreas disponibles.</p>
            )}
            {error && (
                <p className="mt-1.5 text-xs text-error-500">{error}</p>
            )} */}
        </div>
    );
}
