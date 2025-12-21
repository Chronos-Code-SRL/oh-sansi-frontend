import { useNavigate } from "react-router";
import Badge from "../ui/badge/Badge"
import { useState } from "react";
import Button from "../ui/button/Button"

interface SimpleBoxProps {
    id: number;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    areas: string[];
    buttonName: String;
    onEdit?: (id: number) => void;
    onToggleActive?: (id: number) => void;
}

export const SimpleBoxMedal: React.FC<SimpleBoxProps> = ({ id, name, status, startDate, endDate, areas, buttonName, onToggleActive }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleButtonClick = () => {
        navigate(`/OlimpiadaAreasMedallero/${id}`);
    };

    return (

        <div className="bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow 
                    flex flex-col justify-between h-full min-h-[300px]">
            <div className="flex items-start justify-between mb-3 relative">
                <h3 className="text-lg font-semibold text-card-foreground leading-tight">
                    {name}
                </h3>
                <div className="flex items-center gap-2">
                    <Badge color={status === "Activa" ? "success" : "error"}>
                        {status}
                    </Badge>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-sm font-medium text-gray-800 mb-1">Fechas:</p>
                <p className="text-sm ">
                    {startDate} - {endDate}
                </p>
            </div>

            <div className="mb-5">
                <p className="text-sm font-medium text-card-foreground mb-2">
                    Áreas asignadas:
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
                <Button size="sm"
                    onClick={handleButtonClick}
                >
                    {buttonName}
                </Button>
            </div>

        </div>

    )
}

