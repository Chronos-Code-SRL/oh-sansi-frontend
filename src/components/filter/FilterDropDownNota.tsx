import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "../../icons";

interface FilterDropdownNotaProps {
  label?: string;
  initialValue?: number;
  finalValue?: number;
  onConfirm: (notaInicial: number, notaFinal: number) => void;
}

export const FilterDropdownNota: React.FC<FilterDropdownNotaProps> = ({
  label = "Nota",
  initialValue = 0,
  finalValue = 100,
  onConfirm,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notaInicial, setNotaInicial] = useState(initialValue);
  const [notaFinal, setNotaFinal] = useState(finalValue);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirm = () => {
    onConfirm(notaInicial, notaFinal);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setNotaInicial(initialValue);
    setNotaFinal(finalValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left m-1">
      {/* Botón principal */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between min-w-[140px] gap-2 rounded-md bg-[#3756A6] px-4 py-2 text-white hover:bg-[#2F55B8] disabled:bg-gray-300 transition"
      >
        {label}
        <ChevronDownIcon
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-[190px] rounded-md bg-white shadow-lg ring-1 ring-gray-200 z-10 p-4">
          <div className="flex justify-between mb-3">
            <div className="flex flex-col w-[48%]">
              <label className="text-sm font-medium mb-1">Nota Inicial</label>
              <input
                type="number"
                value={notaInicial}
                onChange={(e) => setNotaInicial(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
              />
            </div>

            <div className="flex flex-col w-[48%]">
              <label className="text-sm font-medium mb-1">Nota Final</label>
              <input
                type="number"
                value={notaFinal}
                onChange={(e) => setNotaFinal(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
              />
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleConfirm}
              className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1 rounded-md transition"
            >
              ✔
            </button>
            <button
              onClick={handleCancel}
              className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1 rounded-md transition font-medium"
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
