import { Modal } from "../../components/ui/modal/index";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";

interface ConfigureAreaModalProps {
    isOpen: boolean;
    onClose: () => void;
    areaName: string;
    olympiadId: number;
    areaId: number;
}

export default function ConfigureMedalModal({
    isOpen,
    onClose,
    areaName,
}: ConfigureAreaModalProps) {

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            showCloseButton={true}
            className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg h-[95vh] overflow-y-auto"
            isFullscreen={false}
        >
            <div className="p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    Configurar Área: {areaName}
                </h2>
                <Label>
                    Define los niveles de competencia para esta área. Cada nivel puede
                    abarcar uno o varios cursos consecutivos.
                </Label>

                <ComponentCard title="Agregar Nuevo Nivel">
                    <div className="space-y-4">
                        <h1>Logica</h1>
                    </div>
                </ComponentCard>


            </div>
        </Modal>
    );
}
