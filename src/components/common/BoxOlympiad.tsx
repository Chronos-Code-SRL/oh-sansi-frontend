import { useNavigate } from "react-router";
import Badge from "../ui/badge/Badge"
import Button from "../ui/button/Button"
import { useOlympiad } from "../../context/OlympiadContext";

interface BoxOlympiadProps {
    id: number;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    areas: string[];
}

export const BoxOlympiad: React.FC<BoxOlympiadProps> = ({ id, name, status, startDate, endDate, areas }) => {
    const navigate = useNavigate();
    const { setSelectedOlympiad } = useOlympiad();

    const isInPlanning = status === "En planificación";
    const isFinished = status === "Terminada";
    const isDisabled = isInPlanning || isFinished;

    const handleButtonClick = () => {
        if (isDisabled) return;
        setSelectedOlympiad({ id, name, status });
        navigate(`/filtros-de-lista/${id}`);
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
                </Badge>
            </div>

            <div className="mb-4">
                <p className="text-sm font-medium text-gray-800 mb-1">Fechas:</p>
                <p className="text-sm ">
                    {startDate} - {endDate}
                </p>
            </div>

            <div className="mb-5">
                <p className="text-sm font-medium text-card-foreground mb-2">
                    Tus Áreas asignadas:
                </p>
                <div className="flex flex-wrap gap-2">

                    {areas.map((area, index) => (
                        <Badge key={index} color="light">
                            {area}
                        </Badge>
                    ))}
                </div>
            </div>
            <div className="flex justify-end">
                <Button
                    size="sm"
                    className="w-full text-white font-medium py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleButtonClick}
                    disabled={isDisabled}
                >
                    {isInPlanning ? "En planificación" : isFinished ? "Olimpiada terminada" : "Acceder a olimpiada"}
                </Button>
            </div>

        </div>

    )
}

