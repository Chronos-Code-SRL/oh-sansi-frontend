import React, { useEffect, useState } from "react";
import { FilterDropdown } from "./FilterDropdown";
import { getContestantByFilters } from "../../api/services/contestantService";
import { FilterList } from "../../types/Contestant";
import { FilterDropdownNota } from "./FilterDropDownNota";

export const FilterBar: React.FC = () => {
  const [contestants, setContestants] = useState<FilterList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string[]>([]);
  const [selectedGrado, setSelectedGrado] = useState<string[]>([]);
  const [selectedNivel, setSelectedNivel] = useState<string[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<string[]>([]);
  const [notaRange, setNotaRange] = useState<{ min: number; max: number } | null>(null);

  // 🔹 Llamada a la API
  useEffect(() => {
    const fetchContestants = async () => {
      try {
        setLoading(true);
        const data = await getContestantByFilters();
        setContestants(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los concursantes");
      } finally {
        setLoading(false);
      }
    };

    fetchContestants();
  }, []);

  // 🔹 Filtros en memoria
  const filteredContestants = contestants.filter((c) => {
    const byGender = selectedGender.length === 0 || selectedGender.includes(c.gender.toLowerCase());
    const byDep = selectedDepartamento.length === 0 || selectedDepartamento.includes(c.department.toLowerCase());
    const byArea = selectedArea.length === 0 || selectedArea.includes(c.area_name.toLowerCase());
    const byGrado = selectedGrado.length === 0 || selectedGrado.includes(c.grade_name.toLowerCase());
    const byNivel = selectedNivel.length === 0 || selectedNivel.includes(c.level_name.toLowerCase());
    const byEstado =
      selectedEstado.length === 0 ||
      selectedEstado.includes(c.status ? "evaluado" : "no evaluado");
    const byNota =
      !notaRange ||
      (c.score !== null && c.score >= notaRange.min && c.score <= notaRange.max);

    return byGender && byDep && byArea && byGrado && byNivel && byEstado && byNota;
  });

  // función para limpiar todos los filtros
  const handleClearFilters = () => {
    setSelectedGender([]);
    setSelectedDepartamento([]);
    setSelectedArea([]);
    setSelectedGrado([]);
    setSelectedNivel([]);
    setSelectedEstado([]);
    setNotaRange(null);
  };

  // 🔹 Controlador de notas
  const handleFilterNota = (min: number, max: number) => {
    setNotaRange({ min, max });
  };

  return (
    <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
      <div className="mx-auto w-full space-y-8">
        <p className="block text-left text-lg font-semibold mb-3">Filtrar por:</p>

        {/* 🔸 Dropdowns de filtro */}
        <div className="">
          <FilterDropdown
            label="Género"
            options={[
              { label: "Masculino", value: "m" },
              { label: "Femenino", value: "f" },
            ]}
            selectedValues={selectedGender}
            onChange={setSelectedGender}
          />

          <FilterDropdown
            label="Departamento"
            options={[
              { label: "La Paz", value: "la paz" },
              { label: "Cochabamba", value: "cochabamba" },
              { label: "Santa Cruz", value: "santa cruz" },
              { label: "Potosí", value: "potosi" },
              { label: "Chuquisaca", value: "chuquisaca" },
              { label: "Tarija", value: "tarija" },
              { label: "Oruro", value: "oruro" },
              { label: "Beni", value: "beni" },
              { label: "Pando", value: "pando" },
            ]}
            selectedValues={selectedDepartamento}
            onChange={setSelectedDepartamento}
          />

          <FilterDropdown
            label="Área"
            options={[
              { label: "Física", value: "física" },
              { label: "Química", value: "química" },
              { label: "Biología", value: "biología" },
              { label: "Matemática", value: "matemática" },
              { label: "Informática", value: "informática" },
              { label: "Astronomía", value: "astronomía" },
              { label: "Robótica", value: "robótica" },
              { label: "Astrofísica", value: "astrofísica" },
            ]}
            selectedValues={selectedArea}
            onChange={setSelectedArea}
          />

          <FilterDropdown
            label="Grado"
            options={[
              { label: "Primero de Primaria", value: "primero de primaria" },
              { label: "Segundo de Primaria", value: "segundo de primaria" },
              { label: "Tercero de Primaria", value: "tercero de primaria" },
              { label: "Cuarto de Primaria", value: "cuarto de primaria" },
              { label: "Quinto de Primaria", value: "quinto de primaria" },
              { label: "Sexto de Primaria", value: "sexto de primaria" },
              { label: "Primero de Secundaria", value: "primero de secundaria" },
              { label: "Segundo de Secundaria", value: "segundo de secundaria" },
              { label: "Tercero de Secundaria", value: "tercero de secundaria" },
              { label: "Cuarto de Secundaria", value: "cuarto de secundaria" },
              { label: "Quinto de Secundaria", value: "quinto de secundaria" },
              { label: "Sexto de Secundaria", value: "sexto de secundaria" },
            ]}
            selectedValues={selectedGrado}
            onChange={setSelectedGrado}
          />

          <FilterDropdown
            label="Nivel"
            options={[
              { label: "Booster", value: "booster" },
              { label: "Master", value: "Master" },
              { label: "Noob", value: "Noob" },
            ]}
            selectedValues={selectedNivel}
            onChange={setSelectedNivel}
          />

          <FilterDropdown
            label="Estado"
            options={[
              { label: "Evaluado", value: "evaluado" },
              { label: "No evaluado", value: "no evaluado" },
            ]}
            selectedValues={selectedEstado}
            onChange={setSelectedEstado}
          />

          <FilterDropdownNota onConfirm={handleFilterNota} />

          {/* 🟢 Botón limpiar filtros */}
          <button
            onClick={handleClearFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Limpiar filtros
          </button>
        </div>

        {/* 🔹 Tabla de resultados */}
        <div className="mt-6 overflow-x-auto">
          {loading ? (
            <p className="text-gray-500 text-center">Cargando datos...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : filteredContestants.length === 0 ? (
            <p className="text-gray-500 text-center">No se encontraron concursantes.</p>
          ) : (
            <table className="min-w-full border border-gray-200 rounded-lg text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border text-center">Nombre</th>
                  <th className="px-4 py-2 border text-center">Apellido</th>
                  <th className="px-4 py-2 border text-center">C.I.</th>
                  <th className="px-4 py-2 border text-center">Género</th>
                  <th className="px-4 py-2 border text-center">Departamento</th>
                  <th className="px-4 py-2 border text-center">Área</th>
                  <th className="px-4 py-2 border text-center">Grado</th>
                  <th className="px-4 py-2 border text-center">Nivel</th>
                  <th className="px-4 py-2 border text-center">Nota</th>
                  <th className="px-4 py-2 border text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredContestants.map((c) => (
                  <tr key={c.contestant_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-center">{c.first_name}</td>
                    <td className="px-4 py-2 border text-center">{c.last_name}</td>
                    <td className="px-4 py-2 border text-center">{c.ci_document}</td>
                    <td className="px-4 py-2 border capitalize text-center">{c.gender}</td>
                    <td className="px-4 py-2 border capitalize text-center ">{c.department}</td>
                    <td className="px-4 py-2 border capitalize text-center">{c.area_name}</td>
                    <td className="px-4 py-2 border capitalize text-center">{c.grade_name}</td>
                    <td className="px-4 py-2 border capitalize text-center">{c.level_name}</td>
                    <td className="px-4 py-2 border text-center">
                      {c.score !== null ? c.score : "—"}
                    </td>
                    <td
                      className={`px-4 py-2 border text-center font-medium ${
                        c.status ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {c.status ? "Evaluado" : "No evaluado"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
