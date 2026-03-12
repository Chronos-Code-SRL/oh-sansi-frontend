
import Button from "../ui/button/Button"

interface BoxAreaProps {
    id: number,
    name: string;
    startDate: string;
    endDate: string;
    onConfigureClick: () => void;

}

export const BoxArea: React.FC<BoxAreaProps> = ({
    name,
    startDate,
    endDate,
    onConfigureClick,
}) => {

    return (

        <div className="bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-card-foreground leading-tight">
                    {name}
                </h3>

            </div>
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-800 mb-1">Fechas:</p>
                <p className="text-sm ">
                    {startDate} - {endDate}
                </p>
            </div>
            <div className="flex justify-end">
                <Button size="sm"
                    onClick={onConfigureClick}
                >
                    Configurar Área
                </Button>
            </div>

        </div>

    )
}

