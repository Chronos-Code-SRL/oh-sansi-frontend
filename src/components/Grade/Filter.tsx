import { useEffect, useRef, useState } from "react";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";


interface FilterProps {
  selectedFilters: {
    estado: string[];
    nivel: string[];
  };
  setSelectedFilters: (filters: any) => void;
}

export default function Filter({ selectedFilters, setSelectedFilters }: FilterProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cierra el menú si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFilter = (type: "estado" | "nivel", value: string) => {
    setSelectedFilters((prev: any) => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  return (
    <div className="relative ml-3" ref={menuRef}>
      <Button
        size="sm"
        variant="outline"
        className="w-full "
        onClick={() => setOpen(!open)}
        startIcon={
        <svg
          className="stroke-current fill-white"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2.29 5.9H17.7" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M17.7 14.1H2.29" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12.08" cy="5.9" r="2" strokeWidth="1.5" />
          <circle cx="7.92" cy="14.1" r="2" strokeWidth="1.5" />
        </svg>}
      >
         Filtros
      </Button>

      {open && (
        <div className="absolute left-0 mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-xl z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Estado</h3>
          </div>
          <div className="px-3 py-2 space-y-1">
            {["Evaluado", "No evaluado"].map((estado) => (
              <div key={estado} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedFilters.estado.includes(estado)}
                  onChange={() => toggleFilter("estado", estado)}
                />
                <span className="text-sm text-gray-700">{estado}</span>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Nivel</h3>
          </div>
          <div className="px-3 py-2 space-y-1">
            {["Primero", "Segundo", "Tercero", "Cuarto", "Quinto", "Sexto"].map((nivel) => (
              <div key={nivel} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedFilters.nivel.includes(nivel)}
                  onChange={() => toggleFilter("nivel", nivel)}
                />
                <span className="text-sm text-gray-700">{nivel}</span>
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => {
                setSelectedFilters({ estado: [], nivel: [] });
                setOpen(false);
              }}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
