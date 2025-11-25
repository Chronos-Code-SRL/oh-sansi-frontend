import { useState } from "react";
import { TrophyGold, TrophySilver, TrophyBronze, Award } from "../../icons";
import Button from "../ui/button/Button";

interface MedalInputsProps {
    onGenerate?: (counts: { gold: number; silver: number; bronze: number; honorable: number }) => void;
    loading?: boolean;
}

export default function MedalInputs({ onGenerate, loading = false }: MedalInputsProps) {
    const [goldCount, setGoldCount] = useState(0);
    const [silverCount, setSilverCount] = useState(0);
    const [bronzeCount, setBronzeCount] = useState(0);
    const [honorableCount, setHonorableCount] = useState(0);

    const medalInputs = [
        {
            icon: TrophyGold,
            label: "Medallas de Oro",
            value: goldCount,
            onChange: setGoldCount,
            iconColor: "text-yellow-500",
            focusColor: "focus:border-yellow-500 focus:ring-yellow-500",
        },
        {
            icon: TrophySilver,
            label: "Medallas de Plata",
            value: silverCount,
            onChange: setSilverCount,
            iconColor: "text-gray-400",
            focusColor: "focus:border-gray-400 focus:ring-gray-400",
        },
        {
            icon: TrophyBronze,
            label: "Medallas de Bronce",
            value: bronzeCount,
            onChange: setBronzeCount,
            iconColor: "text-orange-600",
            focusColor: "focus:border-orange-500 focus:ring-orange-500",
        },
        {
            icon: Award,
            label: "Mención honorífica",
            value: honorableCount,
            onChange: setHonorableCount,
            iconColor: "text-purple-500",
            focusColor: "focus:border-purple-500 focus:ring-purple-500",
        },
    ];

    const handleNumberInput = (
        value: string,
        setter: (val: number) => void
    ) => {
        const num = parseInt(value, 10);
        if (!isNaN(num) && num >= 0) {
            setter(num);
        } else if (value === "") {
            setter(0);
        }
    };

    const handleGenerate = () => {
        if (onGenerate) {
            onGenerate({
                gold: goldCount,
                silver: silverCount,
                bronze: bronzeCount,
                honorable: honorableCount,
            });
        }
    };

    return (
        <div className="mb-6">
            {/* Grid de inputs de medallas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {medalInputs.map((medal) => (
                    <div
                        key={medal.label}
                        className="flex flex-col gap-2 p-3 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
                    >
                        <div className="flex items-center gap-2">
                            <medal.icon className={`h-6 w-6 ${medal.iconColor}`} />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {medal.label}
                            </span>
                        </div>
                        <input
                            type="number"
                            min="0"
                            value={medal.value}
                            onChange={(e) => handleNumberInput(e.target.value, medal.onChange)}
                            className={`w-full px-3 py-2 text-center text-lg font-semibold rounded-md border border-gray-300 bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white transition-colors ${medal.focusColor} focus:outline-none focus:ring-2`}
                            placeholder="0"
                        />
                    </div>
                ))}
            </div>

            <Button
                variant="primary"
                className="w-full mt-4"
                onClick={handleGenerate}
                disabled={loading}
            >
                {loading ? "Generando medallero..." : "Reajustar Medallero"}
            </Button>
        </div>
    );
}
