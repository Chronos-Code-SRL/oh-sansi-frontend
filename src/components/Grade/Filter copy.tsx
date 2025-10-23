import { useEffect, useRef, useState } from "react";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { FilterIcon } from "../../icons";

interface FilterProps {
  selectedFilters: {
    estado: string[];
    nivel: string[];
    grado: string[];
  };
  setSelectedFilters: (filters: any) => void;
}

export default function Filter({ selectedFilters, setSelectedFilters }: FilterProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Estado");
  const menuRef = useRef<HTMLDivElement>(null);

  // Cierra el menú si se hace clic fuera (solo en desktop)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFilter = (type: "estado" | "nivel" | "grado", value: string) => {
    setSelectedFilters((prev: any) => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const filterOptions = {
    Estado: ["Evaluado", "No Evaluado"],
    Nivel: ["Primero", "Segundo", "Tercero", "Cuarto", "Quinto", "Sexto"],
    Grado: [
      "Primero de primaria","Segundo de primaria","Tercero de primaria","Cuarto de primaria",
      "Quinto de primaria","Sexto de primaria", "Primero de secundaria","Segundo de secundaria",
      "Tercero de secundaria","Cuarto de secundaria","Quinto de secundaria","Sexto de secundaria",
    ],
  };

  return (
    <div className="relative ml-3" ref={menuRef}>
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() => setOpen(!open)}
        startIcon={<FilterIcon/>}
      >
        Filtros
      </Button>

      {/*Desktop */}
      {open && (
        <div
          className="hidden sm:flex absolute left-0 mt-2 w-[500px] h-[250px] max-w-[95vw]
                     rounded-lg border border-gray-200 bg-white shadow-2xl z-50
                     flex-col sm:flex-row overflow-hidden"
        >
          {/* Tabs (lado izquierdo) */}
          <div className="w-1/3 border-r border-gray-200 py-2">
            {Object.keys(filterOptions).map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm cursor-pointer ${
                  activeTab === tab
                    ? "bg-blue-50 text-blue-600 font-medium border-l-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* Panel de opciones */}
          <div className="flex-1 flex flex-col h-full max-h-[300px] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {activeTab === "Estado" &&
                filterOptions.Estado.map((estado) => (
                  <label key={estado} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedFilters.estado.includes(estado)}
                      onChange={() => toggleFilter("estado", estado)}
                    />
                    <span className="text-sm text-gray-700">{estado}</span>
                  </label>
                ))}

              {activeTab === "Nivel" &&
                filterOptions.Nivel.map((nivel) => (
                  <label key={nivel} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedFilters.nivel.includes(nivel)}
                      onChange={() => toggleFilter("nivel", nivel)}
                    />
                    <span className="text-sm text-gray-700">{nivel}</span>
                  </label>
                ))}

              {activeTab === "Grado" &&
                filterOptions.Grado.map((grado) => (
                  <label key={grado} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedFilters.grado.includes(grado)}
                      onChange={() => toggleFilter("grado", grado)}
                    />
                    <span className="text-sm text-gray-700">{grado}</span>
                  </label>
                ))}
            </div>

            <div className="border-t border-gray-200 bg-white p-3 text-right sticky bottom-0">
              <button
                onClick={() => {
                  setSelectedFilters({ estado: [], nivel: [], grado: [] });
                }}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  Mobile  */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl w-[90%] max-w-sm h-[70%] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white shadow-sm">
              <span className="font-medium text-gray-800 text-base">Filtros</span>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 text-xl hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 px-3 py-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
              {Object.keys(filterOptions).map((tab) => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm cursor-pointer ${
                    activeTab === tab
                      ? "bg-blue-50 text-blue-600 font-medium border-b-2 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* Opciones */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeTab === "Estado" &&
                filterOptions.Estado.map((estado) => (
                  <label key={estado} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedFilters.estado.includes(estado)}
                      onChange={() => toggleFilter("estado", estado)}
                    />
                    <span className="text-sm text-gray-700">{estado}</span>
                  </label>
                ))}

              {activeTab === "Nivel" &&
                filterOptions.Nivel.map((nivel) => (
                  <label key={nivel} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedFilters.nivel.includes(nivel)}
                      onChange={() => toggleFilter("nivel", nivel)}
                    />
                    <span className="text-sm text-gray-700">{nivel}</span>
                  </label>
                ))}

              {activeTab === "Grado" &&
                filterOptions.Grado.map((grado) => (
                  <label key={grado} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedFilters.grado.includes(grado)}
                      onChange={() => toggleFilter("grado", grado)}
                    />
                    <span className="text-sm text-gray-700">{grado}</span>
                  </label>
                ))}
            </div>

            {/* Botón limpiar */}
            <div className="border-t border-gray-200 bg-white p-3 text-right">
              <button
                onClick={() => {
                  setSelectedFilters({ estado: [], nivel: [], grado: [] });
                }}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
