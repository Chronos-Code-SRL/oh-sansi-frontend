import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import DatePicker from "../date-picker.tsx";
import Button from "../../ui/button/Button.tsx";
import AdminSelectInputs from "./AdminSelectInputs.tsx";
import {createOlympiad} from "../../../api/postCreateOlympiad"; // Adjust the path as needed
import { useState } from "react";


export default function AdminDefaultInputs() {
    const [name, setName] = useState("");
    const [edition, setEdition] = useState("");
    const [start_date, setStart_date] = useState("");
    const [end_date, setEnd_date] = useState("");
    const [number_of_phases, setNumber_of_phases] = useState("");
    ///const [areas, setAreas] = useState<string[]>([]);

      const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const datos = {
          name,
          edition,
          start_date,
          end_date,
          number_of_phases,
          // areas,
      };

      const resultado = await createOlympiad.postOlympiad(datos);
      const data = resultado.data;
      if (resultado.status === 201) {
        alert(data.message);
      }
      console.log('listo siuuuu', resultado);
    } catch (error) {
        alert(error);
      // areas,
      };
  };

    return (
        <form onSubmit={handleSubmit}>
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
                        className="w-full border-gray-300 focus:border-blue-500"
                    />
                </div>

                {/* Nombre Olimpiada */}
                <div className="space-y-1.5">
                    <Label htmlFor="edition" className="block text-sm font-medium text-gray-700">
                        Nombre Olimpiada
                    </Label>
                    <Input
                        id="edition"
                        type="text"
                        placeholder=" 10ma Edición"
                        value={edition}
                        onChange={(e) => setEdition(e.target.value)}
                        className="w-full border-gray-300 focus:border-blue-500"
                    />
                </div>

                {/* Número de etapas */}
                <div className="space-y-1.5">
                    <Label htmlFor="number_of_phases" className="block text-sm font-medium text-gray-700">
                        Número de etapas
                    </Label>
                    <Input
                        id="number_of_phases"
                        type="number"
                        value={number_of_phases}
                        onChange={(e) => setNumber_of_phases(e.target.value)}
                        placeholder="Ingrese el número de etapas para la olimpiada"
                        className="w-full border-gray-300 focus:border-blue-500"
                    />
                </div>

                {/* Fechas */}
                <div className="space-y-1.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <DatePicker 
                            id="date-start" 
                            label="Fecha de inicio" 
                            placeholder="yyyy-mm-dd" 
                            onChange={(selectedDates) => {
                            if (selectedDates.length > 0) {
                                setStart_date(selectedDates[0].toISOString().split("T")[0]); 
                            }
                            }}
                        />
                        <DatePicker 
                            id="end_date" 
                            label="Fecha de finalización" 
                            placeholder="yyyy-mm-dd" 
                            onChange={(selectedDates) => {
                            if (selectedDates.length > 0) {
                                setEnd_date(selectedDates[0].toISOString().split("T")[0]); 
                            }
                            }}
                        />
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
        </form>
    );
}
