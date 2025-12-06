import { useState } from "react";
import Button from "../ui/button/Button";
import { TrophyGold, TrophySilver, TrophyBronze, Award } from "../../icons";

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
}

export default function MedalManagementForm({
    selectedAreaId,
    selectedLevelId,
    onGenerateMedals,
    onShowAlert,
}: MedalManagementFormProps) {
    const [goldCount, setGoldCount] = useState("");
    const [silverCount, setSilverCount] = useState("");
    const [bronzeCount, setBronzeCount] = useState("");
    const [honorableMentionCount, setHonorableMentionCount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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

            // Limpiar el formulario después de éxito
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
                {/* Oro */}
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

                {/* Plata */}
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

                {/* Bronce */}
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

                {/* Mención Honorífica */}
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

            {/* <button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedAreaId || !selectedLevelId}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
                {isSubmitting ? "Generando..." : "Generar Medallero"}
            </button> */}
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
