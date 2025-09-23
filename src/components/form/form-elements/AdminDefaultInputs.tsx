import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import DatePicker from "../date-picker.tsx";
import Button from "../../ui/button/Button.tsx";

export default function AdminDefaultInputs() {

    return (
        <ComponentCard title="Completa la informacion básica para comenzar">
            <div className="space-y-6">
                <div>
                    <Label htmlFor="input">Nombre Olimpiada</Label>
                    <Input type="text" id="input" placeholder="Ej. Olimpiada Nacional de Tecnologia 2025"/>
                </div>

                <div>
                    <Label>Numero de etapas</Label>
                    <Input placeholder="Ingrese el numero de etapas para la olimpiada"/>
                </div>

                <div>
                    <DatePicker
                        id="date-start"
                        label="Fecha de inicio"
                        placeholder="dd/mm/yyyy"
                        //MAKE CALENDAR

                        onChange={(dates, currentDateString) => {
                            // Handle your logic
                            console.log({ dates, currentDateString });
                        }}
                    />
                </div>
                
                <div>
                    <DatePicker
                        id="date-end"
                        label="Fecha de finalizacion"
                        placeholder="dd/mm/yyyy"
                        //Make Calendar
                        onChange={(dates, currentDateString) => {
                            // Handle your logic
                            console.log({ dates, currentDateString });
                        }}
                    />
                </div>
            </div>
            <Button children="Conitunar a continuacion de Areas"/>
            
        </ComponentCard>
    );
}
