import { useNavigate } from "react-router";

import Button from "../ui/button/Button"

interface BoxAreaProps {
    id: number,
    name: string;
    startDate: string;
    endDate: string;
    onConfigureClick: () => void;

}

export const BoxArea: React.FC<BoxAreaProps> = ({
  id,
  name,
  startDate,
  endDate,
  onConfigureClick,
}) => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    // Lógica de Grissell (si más adelante redirigís o abrís modal)
    onConfigureClick();
  };


    return (

        <div className="bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-card-foreground leading-tight">
                    {/* Aca tenemos que consumir de la Api el nombre de la olimpiada */}
                    {name}
                </h3>

            </div>
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-800 mb-1">Fechas:</p>
                <p className="text-sm ">
                    {startDate} - {endDate}  {/*Aca tengo que consumir de la Api las fechas para ponerlo*/}
                </p>
            </div>
            <div>
                <Button size="sm"
                    className="w-full text-white font-medium py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onConfigureClick}
                >
                    Configurar Area
                </Button>
            </div>

        </div>

    )
}

