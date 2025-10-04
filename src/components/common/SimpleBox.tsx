import { useNavigate } from "react-router";
import Badge from "../ui/badge/Badge"
import Button from "../ui/button/Button"

interface SimpleBoxProps {
    id: number; //Para que pasemo el ID Como parametro id tiene que ser obligario
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    areas: string[];
}

export const SimpleBox: React.FC<SimpleBoxProps> = ({ id, name, status, startDate, endDate, areas }) => {
    const navigate = useNavigate(); // Hook para manejar la navegación


    // Función para manejar el clic en el botón
    const handleButtonClick = () => {
        // Redirigimos a la página de registro con el id de la olimpiada
        navigate(`/ConfiguracionArea/${id}`);
    };


    return (

        <div className="bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-card-foreground leading-tight">
                    {/* Aca tenemos que consumir de la Api el nombre de la olimpiada */}
                    {name}
                </h3>
                <Badge color={status === "Activo" ? "success" : "error"}>
                    {status}
                </Badge>  {/*Aca tengo que consumir de la Api si esta activo o inactivo */}
            </div>

            <div className="mb-4">
                <p className="text-sm font-medium text-gray-800 mb-1">Fechas:</p>
                <p className="text-sm ">
                    {startDate} - {endDate}  {/*Aca tengo que consumir de la Api las fechas para ponerlo*/}
                </p>
            </div>

            <div className="mb-5">
                <p className="text-sm font-medium text-card-foreground mb-2">
                    Áreas asignadas:
                </p>
                <div className="flex flex-wrap gap-2">

                    {/*Aca tengo que consumir de la Api todas las areas que tiene esa olimpiada y se tiene que automatizar en poner
                     los n areas para y solo usar un Badge y talves usar el Map*/}
                    {areas.map((area, index) => (
                        <Badge key={index} color="light">
                            {area}
                        </Badge>
                    ))}
                </div>
            </div>
            <div>
                <Button size="sm"
                    className="w-full text-white font-medium py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleButtonClick}
                >
                    Configurar Áreas
                </Button>
            </div>

        </div>

    )
}

