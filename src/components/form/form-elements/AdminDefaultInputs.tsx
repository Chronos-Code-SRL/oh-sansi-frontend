import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import DatePicker from "../date-picker.tsx";
import Button from "../../ui/button/Button.tsx";
import AdminSelectInputs from "./AdminSelectInputs.tsx";
import { createOlympiad } from "../../../api/postCreateOlympiad";
import { useState } from "react";


export default function AdminDefaultInputs() {
    const [name, setName] = useState("");
    const [edition, setEdition] = useState("");
    const [start_date, setStart_date] = useState(""); // formato YYYY-MM-DD
    const [end_date, setEnd_date] = useState("");
    const [number_of_phases, setNumber_of_phases] = useState("");
    // const [areas, setAreas] = useState<string[]>([]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Regex: solo letras (incluye acentos), números y espacios
    const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ]+$/;

    const todayISO = () => new Date().toISOString().split("T")[0];

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const today = todayISO();

        // Nombre obligatorio + sin caracteres especiales
        if (!name.trim()) {
            newErrors.name = "El nombre de la olimpiada es obligatorio";
        } else if (!nameRegex.test(name.trim())) {
            newErrors.name = "Solo se permiten letras, números y espacios";
        }

        // Edición (obligatorio)
        if (!edition.trim()) {
            newErrors.edition = "La edición es obligatoria";
        }

        // Número de fases: entero >= 2
        if (!number_of_phases.toString().trim()) {
            newErrors.number_of_phases = "El número de etapas es obligatorio";
        } else {
            const n = Number(number_of_phases);
            if (Number.isNaN(n) || !Number.isInteger(n)) {
                newErrors.number_of_phases = "Debe ser un número entero";
            } else if (n < 2) {
                newErrors.number_of_phases = "Debe ser al menos 2";
            } else if (n > 50) {
                newErrors.number_of_phases = "El máximo permitido es 50";
            }
        }

        // Fechas
        if (!start_date) {
            newErrors.start_date = "La fecha de inicio es obligatoria";
        } else if (start_date < today) {
            newErrors.start_date = "No puede ser una fecha pasada";
        }

        if (!end_date) {
            newErrors.end_date = "La fecha de finalización es obligatoria";
        } else if (end_date < today) {
            newErrors.end_date = "No puede ser una fecha pasada";
        }

        if (start_date && end_date) {
            if (new Date(start_date) > new Date(end_date)) {
                newErrors.end_date = "Debe ser posterior o igual a la fecha de inicio";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateField = (field: string, value: string) => {
        setErrors(prev => {
            const draft = { ...prev };
            const today = todayISO();
            switch (field) {
                case "name":
                    if (!value.trim()) draft.name = "El nombre de la olimpiada es obligatorio";
                    else if (!nameRegex.test(value.trim())) draft.name = "Solo se permiten letras, números y espacios";
                    else delete draft.name;
                    break;
                case "edition":
                    if (!value.trim()) draft.edition = "La edición es obligatoria"; else delete draft.edition; break;
                case "number_of_phases":
                    if (!value.trim()) draft.number_of_phases = "El número de etapas es obligatorio"; else {
                        const n = Number(value);
                        if (Number.isNaN(n) || !Number.isInteger(n)) draft.number_of_phases = "Debe ser un número entero";
                        else if (n < 2) draft.number_of_phases = "Debe ser al menos 2";
                        else if (n > 50) draft.number_of_phases = "El máximo permitido es 50"; else delete draft.number_of_phases;
                    }
                    break;
                case "start_date":
                    if (!value) draft.start_date = "La fecha de inicio es obligatoria";
                    else if (value < today) draft.start_date = "No puede ser una fecha pasada"; else {
                        delete draft.start_date;
                        if (end_date && new Date(value) > new Date(end_date)) {
                            draft.end_date = "Debe ser posterior o igual a la fecha de inicio";
                        } else if (end_date && draft.end_date === "Debe ser posterior o igual a la fecha de inicio") {
                            delete draft.end_date;
                        }
                    }
                    break;
                case "end_date":
                    if (!value) draft.end_date = "La fecha de finalización es obligatoria";
                    else if (value < today) draft.end_date = "No puede ser una fecha pasada"; else if (start_date && new Date(start_date) > new Date(value)) draft.end_date = "Debe ser posterior o igual a la fecha de inicio"; else delete draft.end_date;
                    break;
            }
            return draft;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
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
            };
            const resp = await createOlympiad.postOlympiad(payload);
            if (resp.status === 201) {
                alert("Olimpiada registrada");
                setName("");
                setEdition("");
                setStart_date("");
                setEnd_date("");
                setNumber_of_phases("");
                setErrors({});
            }
        } catch (err: any) {
            alert(err?.message || "Error al crear la olimpiada");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
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
                            onBlur={(e) => validateField("name", e.target.value)}
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
                            placeholder="10ma Edición"
                            value={edition}
                            onChange={(e) => setEdition(e.target.value)}
                            onBlur={(e) => validateField("edition", e.target.value)}
                            error={!!errors.edition}
                            hint={errors.edition}
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
                            onBlur={(e) => validateField("number_of_phases", e.target.value)}
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
                                    placeholder="yyyy-mm-dd"
                                    onChange={(selectedDates) => {
                                        if (selectedDates.length > 0) {
                                            const value = selectedDates[0].toISOString().split("T")[0];
                                            setStart_date(value);
                                            validateField("start_date", value);
                                        }
                                    }}
                                />
                                {errors.start_date && <p className="mt-1.5 text-xs text-error-500">{errors.start_date}</p>}
                            </div>
                            <div>
                                <DatePicker
                                    id="end_date"
                                    label="Fecha de finalización"
                                    placeholder="yyyy-mm-dd"
                                    onChange={(selectedDates) => {
                                        if (selectedDates.length > 0) {
                                            const value = selectedDates[0].toISOString().split("T")[0];
                                            setEnd_date(value);
                                            validateField("end_date", value);
                                        }
                                    }}
                                />
                                {errors.end_date && <p className="mt-1.5 text-xs text-error-500">{errors.end_date}</p>}
                            </div>
                        </div>
                    </div>

                    <AdminSelectInputs />

                    {Object.keys(errors).length > 0 && (
                        <div className="rounded border border-error-300 bg-error-50 px-3 py-2 text-xs text-error-600">
                            Corrige los errores antes de continuar.
                        </div>
                    )}

                    <div className="pt-3">
                        <Button disabled={isSubmitting} className="w-full text-white font-medium py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? "Creando..." : "Crear olimpiada"}
                        </Button>
                    </div>
                </div>
            </ComponentCard>
        </form>
    );
}
