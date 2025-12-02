import { useNavigate } from "react-router";
import Badge from "../ui/badge/Badge"
import Button from "../ui/button/Button"
import { useOlympiad } from "../../context/OlympiadContext";

interface BoxOlympiadProps {
    id: number; //Para que pasemo el ID Como parametro id tiene que ser obligario
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    areas: string[];
}

export const BoxOlympiad: React.FC<BoxOlympiadProps> = ({ id, name, status, startDate, endDate, areas }) => {
    const navigate = useNavigate(); // Hook para manejar la navegación
    const { setSelectedOlympiad } = useOlympiad();

    // Verificar si la olimpiada está en planificación
    const isInPlanning = status === "En planificación";

    // Función para manejar el clic en el botón
    const handleButtonClick = () => {
        if (isInPlanning) return; // No permitir acceso si está en planificación
        setSelectedOlympiad({ id, name, status });
        navigate(`/registration`);
    };


    return (

        <div
            className="group flex h-full min-h-[300px] flex-col justify-between rounded-xl border border-border
                    bg-white/95 p-6 shadow-sm transition-all 
                    hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white hover:shadow-md
                     opacity-95 hover:opacity-100 focus-within:opacity-100
                    dark:bg-white/[0.03] ">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-card-foreground leading-tight">
                    {/* Aca tenemos que consumir de la Api el nombre de la olimpiada */}
                    {name}
                </h3>
                <Badge
                    color={
                        status === "Activa" ? "success" :
                            status === "En planificación" ? "error" :
                                "warning"
                    }
                >
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
                    Tus Áreas asignadas:
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
            <div className="mt-auto">
                <Button
                    size="sm"
                    className="w-full text-white font-medium py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleButtonClick}
                    disabled={isInPlanning}
                >
                    {isInPlanning ? "En planificación" : "Acceder a olimpiada"}
                </Button>
            </div>

        </div>

    )
}

