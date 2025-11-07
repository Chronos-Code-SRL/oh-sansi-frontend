import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import DatePicker from "../date-picker.tsx";
import Button from "../../ui/button/Button.tsx";
import { useState } from "react";
import { validateOlympiad, validateField as validateOneField } from "../../../validation/olympiadValidation";
import { Modal } from "../../ui/modal/index";
import { postOlympiad } from "../../../api/services/olympiadService.ts";
import { OlympiadPayload } from "../../../types/Olympiad.ts";
import AreaSelectInputs from "../../common/AreaSelectInputs .tsx";


export default function AdminDefaultInputs() {
    const [name, setName] = useState("");
    const [default_score_cut, setDefault_score_cut] = useState("");
    const [start_date, setStart_date] = useState(""); // formato YYYY-MM-DD
    const [end_date, setEnd_date] = useState("");
    const [number_of_phases, setNumber_of_phases] = useState("");
    const [areas, setAreas] = useState<string[]>([]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const buildValues = () => ({
        name,
        default_score_cut,
        start_date,
        end_date,
        number_of_phases,
        areas,
    });

    const runFullValidation = () => {
        const result = validateOlympiad(buildValues());
        setErrors(result.errors);
        return result.valid;
    };

    // Permite pasar un valor inmediato (overrideValue) para validar antes de que setState se refleje
    const handleBlurField = (field: keyof ReturnType<typeof buildValues>, overrideValue?: string) => {
        const current = buildValues();
        if (overrideValue !== undefined) {
            (current as any)[field] = overrideValue;
        }
        const result = validateOneField(field, current);
        setErrors(prev => {
            const next = { ...prev } as Record<string, string>;
            // eliminar error previo del campo
            delete next[field as string];
            // si ahora hay error, lo agregamos
            if (!result.valid) {
                const key = Object.keys(result.errors)[0];
                if (key) next[key] = result.errors[key];
            }
            // Validación cruzada: si se cambia start_date y end_date existe, revalidar end_date (y viceversa)
            if ((field === 'start_date' || field === 'end_date') && current.start_date && current.end_date) {
                const crossField: 'start_date' | 'end_date' = field === 'start_date' ? 'end_date' : 'start_date';
                const crossResult = validateOneField(crossField, current);
                delete next[crossField];
                if (!crossResult.valid) {
                    const ck = Object.keys(crossResult.errors)[0];
                    if (ck) next[ck] = crossResult.errors[ck];
                }
            }
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!runFullValidation()) {
            const firstError = Object.keys(errors)[0];
            if (firstError) document.getElementById(firstError)?.focus();
            return;
        }
        setIsSubmitting(true);
        try {
            const payload: OlympiadPayload = {
                name: name.trim(),
                default_score_cut: parseInt(default_score_cut, 10),
                start_date: start_date.trim(), // Cambiar a `start_date` para coincidir con el backend
                end_date: end_date.trim(), // Cambiar a `end_date` para coincidir con el backend
                number_of_phases: parseInt(number_of_phases, 10), // Aseguramos que sea un número entero
                areas: areas.length > 0 ? areas : [], // Validamos que sea un array de strings
            };

            //const resp = await createOlympiad.postOlympiad(payload);
            const createdOlympiad = await postOlympiad(payload); // Usar la nueva función
            console.log('[handleSubmit] Olimpiada creada:', createdOlympiad);
            if (createdOlympiad) {
                // Limpiar formulario y mostrar modal de éxito
                setName("");
                setStart_date("");
                setEnd_date("");
                setNumber_of_phases("");
                setAreas([]);
                setErrors({});
                setIsModalOpen(true);
            }
        } catch (err: any) {
            // Podríamos en el futuro usar un modal de error o toast centralizado
            window.alert(err?.message || "Error al crear la olimpiada");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} noValidate>
                <ComponentCard title="Completa la informacion básica para comenzar">
                    <div className="space-y-5 max-w-2xl mx-auto"> {/* space-y-5 para 20px de separación */}

                        {/* Nombre Olimpiada */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nombre Olimpiada
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Olimpiada Nacional de Tecnología 2025"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={() => handleBlurField("name")}
                                error={!!errors.name}
                                hint={errors.name}
                                className="w-full border-gray-300 focus:border-blue-500"
                            />
                        </div>

                        {/* Número de etapas */}
                        <div className="space-y-1.5">
                            <Label htmlFor="number_of_phases" className="block text-sm font-medium text-gray-700">
                                Número de Fases
                            </Label>
                            <Input
                                id="number_of_phases"
                                type="number"
                                value={number_of_phases}
                                onChange={(e) => setNumber_of_phases(e.target.value)}
                                onBlur={() => handleBlurField("number_of_phases")}
                                error={!!errors.number_of_phases}
                                hint={errors.number_of_phases}
                                placeholder="Ingrese el número de etapas (mínimo 2)"
                                className="w-full border-gray-300 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="default_score_cut" className="block text-sm font-medium text-gray-700">
                                Umbral de puntuación
                            </Label>
                            <Input
                                id="default_score_cut"
                                type="number"
                                value={default_score_cut}
                                onChange={(e) => setDefault_score_cut(e.target.value)}
                                onBlur={() => handleBlurField("default_score_cut")}
                                error={!!errors.default_score_cut}
                                hint={errors.default_score_cut}
                                placeholder="Ingrese el umbral de puntuación"
                                className="w-full border-gray-300 focus:border-blue-500"
                            />
                        </div>

                        {/* Fechas */}
                        <div className="space-y-1.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <DatePicker
                                        id="date-start"
                                        label="Fecha de inicio"
                                        placeholder="AAAA-MM-DD"
                                        onChange={(selectedDates) => {
                                            if (selectedDates.length > 0) {
                                                const value = selectedDates[0].toISOString().split("T")[0];
                                                setStart_date(value);
                                                handleBlurField("start_date", value);
                                            }
                                        }}
                                    />
                                    {errors.start_date && <p className="mt-1.5 text-xs text-error-500">{errors.start_date}</p>}
                                </div>
                                <div>
                                    <DatePicker
                                        id="end_date"
                                        label="Fecha de finalización"
                                        placeholder="AAAA-MM-DD"
                                        onChange={(selectedDates) => {
                                            if (selectedDates.length > 0) {
                                                const value = selectedDates[0].toISOString().split("T")[0];
                                                setEnd_date(value);
                                                handleBlurField("end_date", value);
                                            }
                                        }}
                                    />
                                    {errors.end_date && <p className="mt-1.5 text-xs text-error-500">{errors.end_date}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Áreas */}
                        <div className="space-y-1.5">
                            <AreaSelectInputs
                                onChange={(values) => {
                                    setAreas(values);
                                    setErrors(prev => {
                                        const draft = { ...prev };
                                        if (values.length === 0) draft.areas = "Seleccione al menos un área"; else delete draft.areas;
                                        return draft;
                                    });
                                }}
                                valueType="name"
                                error={errors.areas}
                            />
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <div className="rounded border border-error-300 bg-error-50 px-3 py-2 text-xs text-error-600">
                                Corrige los errores antes de continuar.
                            </div>
                        )}

                        <div className="pt-3">
                            <Button disabled={isSubmitting} className="w-full text-white font-medium py-2.5 disabled:opacity-50 disabled:cursor-not-allowed ">
                                {isSubmitting ? "Creando..." : "Crear olimpiada"}
                            </Button>
                        </div>
                    </div>
                </ComponentCard>
            </form>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                showCloseButton={true}
                isFullscreen={false}
                className="max-w-md mx-auto shadow-lg"
            >
                <div className="p-6 text-center">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        ¡Olimpiada registrada!
                    </h2>
                    <Label>La olimpiada se creó correctamente.</Label>
                    <div className="mt-5">
                        <Button
                            size="md"
                            variant="primary"
                            className="w-full"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Aceptar
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
