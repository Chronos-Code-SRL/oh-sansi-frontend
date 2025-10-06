import { useState } from "react";
import ConfigureAreaModal from "./ConfigureAreaModal";
import Button from "../../components/ui/button/Button";

export default function TestConfigureArea() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-10 space-y-6 text-center">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
        Vista de prueba — Configurar Área
      </h1>

      <Button
        variant="primary"
        onClick={() => setIsModalOpen(true)}
        className="px-6"
      >
        Abrir Modal
      </Button>

      <ConfigureAreaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        areaName="Robótica 2"
      />
    </div>
  );
}
