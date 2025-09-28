import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import DatePicker from "../date-picker.tsx";
import Button from "../../ui/button/Button.tsx";
import AdminSelectInputs from "./AdminSelectInputs.tsx";

import SelectInputs from "./SelectInputs.tsx";

export default function AdminDefaultInputs() {

    return (
        <ComponentCard title="Completa la informacion básica para comenzar">
            <div className="space-y-5 max-w-2xl mx-auto"> {/* space-y-5 para 20px de separación */}

                {/* Nombre Olimpiada */}
                <div className="space-y-1.5">
                    <Label htmlFor="olimpiada-name" className="block text-sm font-medium text-gray-700">
                        Nombre Olimpiada
                    </Label>
                    <Input
                        type="text"
                        id="olimpiada-name"
                        placeholder="Olimpiada Nacional de Tecnología 2025"
                        className="w-full border-gray-300 focus:border-blue-500"
                    />
                </div>

                {/* Número de etapas */}
                <div className="space-y-1.5">
                    <Label htmlFor="etapas" className="block text-sm font-medium text-gray-700">
                        Número de etapas
                    </Label>
                    <Input
                        id="etapas"
                        type="number"
                        placeholder="Ingrese el número de etapas para la olimpiada"
                        className="w-full border-gray-300 focus:border-blue-500"
                    />
                </div>

                {/* Fechas */}
                <div className="space-y-1.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <DatePicker id="date-start" label="Fecha de inicio" placeholder="yyyy/mm/dd" />
                        <DatePicker id="date-end" label="Fecha de finalización" placeholder="yyyy/mm/dd" />
                    </div>
                </div>

                <AdminSelectInputs />

                {/* Botón */}
                <div className="pt-3">
                    <Button className="w-full text-white font-medium py-2.5">
                        Crear olimpiada
                    </Button>

                </div>
            </div>
        </ComponentCard>
    );
}
