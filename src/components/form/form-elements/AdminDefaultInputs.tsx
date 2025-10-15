import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import DatePicker from "../date-picker.tsx";
import Button from "../../ui/button/Button.tsx";
import AdminSelectInputs from "./AdminSelectInputs.tsx";
import { createOlympiad } from "../../../api/postCreateOlympiad";
import { useState } from "react";
import { validateOlympiad, validateField as validateOneField } from "../../../validation/olympiadValidation";
import { Modal } from "../../ui/modal/index";


export default function AdminDefaultInputs() {
    const [name, setName] = useState("");
    const [edition, setEdition] = useState("");
    const [start_date, setStart_date] = useState(""); // formato YYYY-MM-DD
    const [end_date, setEnd_date] = useState("");
    const [number_of_phases, setNumber_of_phases] = useState("");
    const [areas, setAreas] = useState<string[]>([]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const buildValues = () => ({
        name,
        edition,
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
            const payload = {
                name: name.trim(),
                edition: edition.trim(),
                start_date,
                end_date,
                number_of_phases: Number(number_of_phases),
                areas: areas, // ahora es array de nombres (string) según valueType='name'
            };

            const resp = await createOlympiad.postOlympiad(payload);
            if (resp.status === 201) {
                // Limpiar formulario y mostrar modal de éxito
                setName("");
                setEdition("");
                setStart_date("");
                setEnd_date("");
                setNumber_of_phases("");
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

                    {/* Nombre Olimpiada */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edition" className="block text-sm font-medium text-gray-700">
                            Nombre de Edicion
                        </Label>
                        <Input
                            id="edition"
                            type="text"
                            placeholder="Ej: 1-2025"
                            value={edition}
                            // Sanitizamos para solo permitir dígitos y un guion, y evitar más de un guion.
                            onChange={(e) => {
                                let v = e.target.value;
                                // eliminar caracteres que no sean dígitos o guion
                                v = v.replace(/[^0-9-]/g, '');
                                // si hay más de un guion, conservar solo el primero
                                const firstDash = v.indexOf('-');
                                if (firstDash !== -1) {
                                    // quitar guiones extra
                                    const before = v.slice(0, firstDash + 1).replace(/-/g, '-');
                                    const after = v.slice(firstDash + 1).replace(/-/g, '');
                                    v = before + after;
                                }
                                // limitar longitud total (ej: hasta 1-YYYY => máximo 6, pero permitimos quizá 2-YYYY => 7) => general: parte izquierda hasta 3 dígitos + '-' + 4 dígitos
                                // No cortamos estrictamente antes del año para permitir escribir progresivamente
                                if (v.length > 10) v = v.slice(0, 10);
                                setEdition(v);
                            }}
                            onBlur={() => handleBlurField("edition")}
                            error={!!errors.edition}
                            hint={errors.edition}
                            className="w-full border-gray-300 focus:border-blue-500"
                            // Ayuda nativa
                            // pattern no se valida automáticamente porque usamos noValidate en el form, pero sirve para mostrar hints en algunos navegadores
                            // @ts-ignore: permitir atributo pattern
                            pattern="^\\d+-\\d{4}$"
                            //fallback nativo
                            title="Formato requerido: n-YYYY (ej: 1-2025)"
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
                        <AdminSelectInputs
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
