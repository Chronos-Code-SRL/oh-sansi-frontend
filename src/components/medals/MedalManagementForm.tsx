import { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import { TrophyGold, TrophySilver, TrophyBronze, Award } from "../../icons";
import { numberOfMedalsByLevel } from "../../types/Contestant";

interface MedalManagementFormProps {
    selectedAreaId: number | null;
    selectedLevelId: number | null;
    onGenerateMedals: (medals: {
        gold: string;
        silver: string;
        bronze: string;
        honorable_mention: string;
    }) => Promise<void>;
    onShowAlert: (title: string, message: string, variant?: "success" | "error" | "warning" | "info") => void;
    medalsByLevel: numberOfMedalsByLevel | null;
}

export default function MedalManagementForm({
    selectedAreaId,
    selectedLevelId,
    onGenerateMedals,
    onShowAlert,
    medalsByLevel,
}: MedalManagementFormProps) {
    const [goldCount, setGoldCount] = useState("");
    const [silverCount, setSilverCount] = useState("");
    const [bronzeCount, setBronzeCount] = useState("");
    const [honorableMentionCount, setHonorableMentionCount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (medalsByLevel) {
            setGoldCount(medalsByLevel.number_gold.toString());
            setSilverCount(medalsByLevel.number_silver.toString());
            setBronzeCount(medalsByLevel.number_bronze.toString());
            setHonorableMentionCount(medalsByLevel.number_honorable_mention.toString());
        } else {
            setGoldCount("");
            setSilverCount("");
            setBronzeCount("");
            setHonorableMentionCount("");
        }
    }, [medalsByLevel]);

    async function handleSubmit() {
        if (!selectedAreaId || !selectedLevelId) {
            onShowAlert("Campos incompletos", "Debe seleccionar un área y nivel.", "warning");
            return;
        }

        if (!goldCount && !silverCount && !bronzeCount && !honorableMentionCount) {
            onShowAlert("Campos vacíos", "Si quiere que nadie tenga medallas, escriba todos los campos en 0. ", "warning");
            return;
        }

        setIsSubmitting(true);
        try {
            await onGenerateMedals({
                gold: goldCount || "0",
                silver: silverCount || "0",
                bronze: bronzeCount || "0",
                honorable_mention: honorableMentionCount || "0",
            });

            setGoldCount("");
            setSilverCount("");
            setBronzeCount("");
            setHonorableMentionCount("");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="inline-flex items-center gap-2">
                            <TrophyGold className="w-5 h-5 text-yellow-500" />
                            Medallas de Oro
                        </span>
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={goldCount}
                        onChange={(e) => setGoldCount(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="inline-flex items-center gap-2">
                            <TrophySilver className="w-5 h-5 text-gray-400" />
                            Medallas de Plata
                        </span>
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={silverCount}
                        onChange={(e) => setSilverCount(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="inline-flex items-center gap-2">
                            <TrophyBronze className="w-5 h-5 text-orange-600" />
                            Medallas de Bronce
                        </span>
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={bronzeCount}
                        onChange={(e) => setBronzeCount(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="inline-flex items-center gap-2">
                            <Award className="w-5 h-5 text-purple-500" />
                            Mención Honorífica
                        </span>
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={honorableMentionCount}
                        onChange={(e) => setHonorableMentionCount(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedAreaId || !selectedLevelId}
                >
                    {isSubmitting ? "Generando..." : "Generar Medallero"}
                </Button>
            </div>
        </>
    );
}
