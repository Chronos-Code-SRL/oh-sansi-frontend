import { useEffect, useRef, useState } from "react";
import Button from "../ui/button/Button";
import { FilterIcon } from "../../icons";
import { Tabs } from "./Filter-elements/TabFilter";
import { OptionsPanel } from "./Filter-elements/OptionFilter";

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFilter = (type: "estado" | "grado", value: string) => {
      // const toggleFilter = (type: "estado" | "nivel" | "grado", value: string) => {
    setSelectedFilters((prev: any) => {
      const current = prev[type];
      const updated = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const filterOptions = {
    Estado: ["Evaluado", "No Evaluado"],
    // Nivel: ["Primero","Segundo","Tercero","Cuarto","Quinto","Sexto"],
    Grado: [
      "Primero de primaria","Segundo de primaria","Tercero de primaria","Cuarto de primaria",
      "Quinto de primaria","Sexto de primaria","Primero de secundaria","Segundo de secundaria",
      "Tercero de secundaria","Cuarto de secundaria","Quinto de secundaria","Sexto de secundaria",
    ],
  };

  const handleClear = () => setSelectedFilters({ estado: [], nivel: [], grado: [] });

  return (
    <div className="relative ml-3" ref={menuRef}>
      <Button size="sm" variant="outline" className="w-full" onClick={() => setOpen(!open)} startIcon={<FilterIcon />}>
        Filtros
      </Button>

      {/* Desktop */}
      {open && (
        <div className="hidden sm:flex absolute left-0 mt-2 w-[500px] h-[250px] max-w-[95vw] rounded-lg border border-gray-200 bg-white shadow-2xl z-50 flex-col sm:flex-row overflow-hidden">
          <Tabs tabs={Object.keys(filterOptions)} activeTab={activeTab} setActiveTab={setActiveTab} vertical />
          <div className="flex-1 flex flex-col h-full max-h-[300px] overflow-hidden">
            <OptionsPanel
              options={filterOptions[activeTab as keyof typeof filterOptions]}
              selected={selectedFilters[activeTab.toLowerCase() as keyof typeof selectedFilters]}
              toggle={(val) => toggleFilter(activeTab.toLowerCase() as any, val)}
            />
            <div className="border-t border-gray-200 bg-white  text-right sticky bottom-0">
              <Button className="font-medium" size="sm" variant="noborder"  
                      onClick={() => {setSelectedFilters({ estado: [], nivel: [], grado: [] });}} >
              Limpiar filtros
              </Button>    
            </div>
          </div>
        </div>
      )}

      {/* Mobile */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl w-[90%] max-w-sm h-[70%] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white shadow-sm">
              <span className="font-medium text-gray-800 text-base">Filtros</span>
              <button onClick={() => setOpen(false)} className="text-gray-500 text-xl hover:text-gray-700">✕</button>
            </div>

            <Tabs tabs={Object.keys(filterOptions)} activeTab={activeTab} setActiveTab={setActiveTab} />

            <OptionsPanel
              options={filterOptions[activeTab as keyof typeof filterOptions]}
              selected={selectedFilters[activeTab.toLowerCase() as keyof typeof selectedFilters]}
              toggle={(val) => toggleFilter(activeTab.toLowerCase() as any, val)}
            />

            <div className="border-t border-gray-200 bg-white text-right sticky bottom-0">
              <Button className="font-medium" size="sm" variant="noborder"  
                      onClick={() => {setSelectedFilters({ estado: [], nivel: [], grado: [] });}} >
              Limpiar filtros
              </Button>    
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
