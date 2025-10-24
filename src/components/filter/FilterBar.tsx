import  { useState } from "react";
import { FilterDropdown } from "./FilterDropdown";
import { FilterDropdownNota } from "./FilterDropDownNota";

export const FilterBar = () => {
    const handleFilterNota = (min: number, max: number) => {
    console.log("Notas seleccionadas:", { min, max });
  };
    const [selectedGender, setSelectedGender] = useState<string[]>([]);
    const [selectedDepartamento, setSelectedDepartamento] = useState<string[]>([]);
    const [selectedArea, setSelectedArea] = useState<string[]>([]);
    const [selectedGrado, setSelectedGrado] = useState<string[]>([]);
    const [selectedNivel, setSelectedNivel] = useState<string[]>([]);
    const [selectedEstado, setSelectedEstado] = useState<string[]>([]);


  return (
    <>
    <div>
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="mx-auto w-full  space-y-8">
          <p className="block text-left text-lg font-semibold mb-3">
                Filtrar por:
          </p>
          <div className="">
            <FilterDropdown 
            label={"Genero"} 
            options={[
                { label: "Masculino", value: "masculino" },
                { label: "Femenino", value: "femenino" },]} 
            selectedValues={selectedGender} 
            onChange={setSelectedGender}/>

            <FilterDropdown
            label={"Departamento"} 
            options={[
                {label: "La Paz", value: "la paz" },
                { label: "Cochabamba",value: "cochabamba" },
                { label: "Santa Cruz",value: "santa cruz" },
                { label: "Potosi",value: "potosi" },
                { label: "Chuquisaca",value: "chuquisaca" },
                { label: "Tarija",value: "tarija" },
                { label: "Oruro",value: "oruro" },
                { label: "Beni",value: "beni" },
                { label: "Pando",value: "pando" },]} 
            selectedValues={selectedDepartamento} 
            onChange={setSelectedDepartamento}/>

            <FilterDropdown
            label={"Area"} 
            options={[
                {label: "Fisica", value: "fisica" },
                { label: "Quimica",value: "quimica" },
                { label: "Biologia",value: "biologia" },
                { label: "Matematica",value: "matematica" },
                { label: "Informatica",value: "informatica" },
                { label: "Astronomia",value: "astronomia" },
                { label: "Robotica",value: "robotica" },
                {label: "Astrofisica", value: "astrofisica" },
            ]} 
            selectedValues={selectedArea} 
            onChange={setSelectedArea}/>

            <FilterDropdown
            label={"Grado"} 
            options={[
                {label: "Primero de Primaria", value: "primero de primaria" },
                { label: "Segundo de Primaria",value: "segundo de primaria" },
                { label: "Tercero de Primaria",value: "tercero de primaria" },
                { label: "Cuarto de Primaria",value: "cuarto de primaria" },
                { label: "Quinto de Primaria",value: "quinto de primaria" },
                { label: "Sexto de Primaria",value: "sexto de primaria" },
                { label: "Primero de Secundaria",value: "primero de secundaria" },
                { label: "Segundo de Secundaria",value: "segundo de secundaria" },
                { label: "Tercero de Secundaria",value: "tercero de secundaria" },
                { label: "Cuarto de Secundaria",value: "cuarto de secundaria" },
                { label: "Quinto de Secundaria",value: "quinto de secundaria" },
                { label: "Sexto de Secundaria",value: "sexto de secundaria" },
            ]} 
            selectedValues={selectedGrado} 
            onChange={setSelectedGrado}/>

            <FilterDropdown
            label={"Nivel"} 
            options={[
                {label: "La Paz", value: "la paz" },
                { label: "Cochabamba",value: "cochabamba" },
                { label: "Santa Cruz",value: "santa cruz" },
                { label: "Potosi",value: "potosi" },
                { label: "Chuquisaca",value: "chuquisaca" },
                { label: "Tarija",value: "tarija" },
                { label: "Oruro",value: "oruro" },
                { label: "Beni",value: "beni" },
                { label: "Pando",value: "pando" },]} 
            selectedValues={selectedNivel} 
            onChange={setSelectedNivel}/>

            <FilterDropdownNota onConfirm={handleFilterNota} />

            <FilterDropdown
            label={"Estado"} 
            options={[
                {label: "Evaluado", value: "evaluado" },
                { label: "No evaluado",value: "no evaluado" },]} 
            selectedValues={selectedEstado} 
            onChange={setSelectedEstado}/>
          </div>
            
        </div>
      </div>
    </div>
    </>
  );
};
