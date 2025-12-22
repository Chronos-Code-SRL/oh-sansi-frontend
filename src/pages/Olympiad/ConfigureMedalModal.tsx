import { useState, useEffect, useRef } from "react";
import { Modal } from "../../components/ui/modal/index";
import Button from "../../components/ui/button/Button";
import Alert from "../../components/ui/alert/Alert";
import { TrophyGold, TrophySilver, TrophyBronze, Award } from "../../icons";
import { createMedals, getMedalsArea } from "../../api/services/medalServices";

interface ConfigureAreaModalProps {
    isOpen: boolean;
    onClose: () => void;
    areaName: string;
    olympiadId: number;
    areaId: number;
    onSuccess?: (feedback?: { title: string; message: string; variant: "success" | "error" | "warning" | "info" }) => void;
}

export default function ConfigureMedalModal({
    isOpen,
    onClose,
    areaName,
    olympiadId,
    areaId,
    onSuccess,
}: ConfigureAreaModalProps) {
    const [gold, setGold] = useState<string>("");
    const [silver, setSilver] = useState<string>("");
    const [bronze, setBronze] = useState<string>("");
    const [honorableMention, setHonorableMention] = useState<string>("");
    const [minimumClassificationScore, setMinimumClassificationScore] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Alert states (floating overlay)
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle, setAlertTitle] = useState<string>("");
    const [alertMessage, setAlertMessage] = useState<string>("");
    const [alertVariant, setAlertVariant] = useState<"success" | "error" | "warning" | "info">("success");
    const autoHideTimerRef = useRef<number | null>(null);

    function showAlert(title: string, message: string, variant: "success" | "error" | "warning" | "info" = "success"): void {
        if (autoHideTimerRef.current !== null) {
            window.clearTimeout(autoHideTimerRef.current);
            autoHideTimerRef.current = null;
        }
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVariant(variant);
        setAlertOpen(true);
        autoHideTimerRef.current = window.setTimeout(() => {
            setAlertOpen(false);
            autoHideTimerRef.current = null;
        }, 4000);
    }

    useEffect(() => {
        if (isOpen) {
            loadMedals();
        }
    }, [isOpen, olympiadId, areaId]);

    const loadMedals = async () => {
        try {
            setIsLoadingData(true);
            const data = await getMedalsArea(olympiadId, areaId);
            setGold(typeof data.gold === "number" ? String(data.gold) : "");
            console.log("Medals data loaded:", data);
            setSilver(typeof data.silver === "number" ? String(data.silver) : "");
            setBronze(typeof data.bronze === "number" ? String(data.bronze) : "");
            setHonorableMention(
                typeof data.honorable_mention === "number" ? String(data.honorable_mention) : ""
            );
            setMinimumClassificationScore(data.minimum_classification_score || 0);
        } catch (error) {
            console.error("Error loading medals:", error);
            setGold("");
            setSilver("");
            setBronze("");
            setHonorableMention("");
            setMinimumClassificationScore(0);
            showAlert("Error al cargar", "No se pudo cargar el medallero.", "error");
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleSubmit = async () => {
        try {
            // Validaciones previas
            const fields = [gold, silver, bronze, honorableMention];
            if (fields.some((v) => v.trim() === "")) {
                showAlert("Campos vacíos", "Completa todos los campos antes de guardar.", "warning");
                return;
            }

            const values = fields.map((v) => parseInt(v, 10));
            if (values.some((n) => Number.isNaN(n))) {
                showAlert("Valores inválidos", "Ingresa solo números válidos en todos los campos.", "error");
                return;
            }

            if (values.some((n) => n < 0)) {
                showAlert("Número negativo", "Los valores no pueden ser negativos.", "error");
                return;
            }

            setIsLoading(true);
            await createMedals(olympiadId, areaId, {
                gold: gold === "" ? 0 : parseInt(gold, 10),
                silver: silver === "" ? 0 : parseInt(silver, 10),
                bronze: bronze === "" ? 0 : parseInt(bronze, 10),
                honorable_mention:
                    honorableMention === "" ? 0 : parseInt(honorableMention, 10),
                minimum_classification_score: minimumClassificationScore,
            });

            setGold("");
            setSilver("");
            setBronze("");
            setHonorableMention("");
            setMinimumClassificationScore(0);

            if (onSuccess) {
                onSuccess({
                    title: "Medallero guardado",
                    message: "Los cambios se guardaron correctamente.",
                    variant: "success",
                });
            }

            onClose();
            showAlert("Medallero guardado", "Los cambios se guardaron correctamente.", "success");
        } catch (error) {
            console.error("Error creating medals:", error);
            showAlert("Error al guardar", "No se pudo guardar el medallero. Intenta nuevamente.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (autoHideTimerRef.current !== null) {
                window.clearTimeout(autoHideTimerRef.current);
                autoHideTimerRef.current = null;
            }
        };
    }, []);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            showCloseButton={true}
            className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg"
            isFullscreen={false}
        >
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Configurar Medallas</h2>
                <p className="text-gray-600 mb-6">{areaName}</p>

                {isLoadingData ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    <span className="inline-flex items-center gap-2">
                                        <TrophyGold className="w-6 h-6 text-yellow-500" />
                                        Medallas de Oro
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={gold}
                                    onChange={(e) => setGold(e.target.value)}
                                    //placeholder="Cantidad de medallas de oro"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    <span className="inline-flex items-center gap-2">
                                        <TrophySilver className="w-6 h-6 text-gray-400" />
                                        Medallas de Plata
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={silver}
                                    onChange={(e) => setSilver(e.target.value)}
                                    //placeholder="Cantidad de medallas de plata"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    <span className="inline-flex items-center gap-2">
                                        <TrophyBronze className="w-6 h-6 text-orange-600" />
                                        Medallas de Bronce
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={bronze}
                                    onChange={(e) => setBronze(e.target.value)}
                                    //placeholder="Cantidad de medallas de bronce"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    <span className="inline-flex items-center gap-2">
                                        <Award className="w-6 h-6 text-purple-500" />
                                        Mención Honorífica
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={honorableMention}
                                    onChange={(e) => setHonorableMention(e.target.value)}
                                    //placeholder="Cantidad de menciones honoríficas"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-lg"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-6">
                            <Button
                                size="md"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading || isLoadingData}
                            >
                                Cancelar
                            </Button>
                            <Button
                                size="md"
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={isLoading || isLoadingData}
                            >
                                {isLoading ? "Guardando..." : "Guardar Medallas"}
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {alertOpen && (
                <div
                    className="fixed bottom-6 right-6 z-[1000] w-[360px] max-w-[92vw] pointer-events-none"
                    role="presentation"
                >
                    <div className="pointer-events-auto" role="alert" aria-live="polite">
                        <Alert
                            variant={alertVariant}
                            title={alertTitle}
                            message={alertMessage}
                        />
                    </div>
                </div>
            )}
        </Modal>
    );
}
