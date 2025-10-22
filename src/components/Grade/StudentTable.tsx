import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import { fetchStudents, Student } from "../../api/services/studentService";
import SearchBar from "./Searcher";
import Filter from "./Filter";


export default function StudentTable() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilters, setSelectedFilters] = useState({
        estado: [] as string[],
        nivel: [] as string[],
    });

    useEffect(() => {
        let alive = true;

        async function cargarEstudiantes() {
            try {
                const data = await fetchStudents();
                console.log("Datos recibidos:", data);
                if (alive) setStudents(data);
            } catch {
                if (alive) setError("No se pudo cargar la lista de estudiantes.");
            } finally {
                if (alive) setLoading(false);
            }
        }

        cargarEstudiantes();
        return () => { alive = false; };
    }, []);

     // Filtrado según el texto recibido
    const normalize = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filteredStudents = students.filter((s) => {
        const q = normalize(searchQuery);
        const matchesSearch =
        normalize(s.nombre).includes(q) ||
        normalize(s.apellido).includes(q) ||
        s.ci.toString().includes(q);

        const matchesEstado =
      selectedFilters.estado.length === 0 ||
      selectedFilters.estado.includes(s.estado);

    const matchesNivel =
      selectedFilters.nivel.length === 0 ||
      selectedFilters.nivel.includes(s.nivel);

        return matchesSearch && matchesEstado && matchesNivel;
    });

    return (
        <>
        <ComponentCard title="Química">
            <div className="flex items-center mb-3">
                <SearchBar
                onSearch={setSearchQuery}
                placeholder="Buscar por nombre, apellido o CI..."
                />
                <Filter 
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                 />
            </div>
                <table className="w-full">
                    <thead className="border-b border-border bg-muted/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nombre</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Apellido</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">CI</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nivel</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Grado</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Estado</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nota</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-sm text-foreground">Cargando...</td>
                            </tr>
                        )}
                        {error && !loading && (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-sm text-red-600">{error}</td>
                            </tr>
                        )}
                         {!loading && !error && filteredStudents.length === 0 && (
                            <tr>
                            <td colSpan={8} className="px-6 py-4 text-sm text-gray-500">
                                No se encontraron resultados.
                            </td>
                            </tr>
                        )}
                        {!loading && !error && filteredStudents.map((s) => (
                            <tr key={s.ci} className="border-b border-border last:border-0">
                                <td className="px-6 py-4 text-sm">{s.nombre}</td>
                                <td className="px-6 py-4 text-sm">{s.apellido}</td>
                                <td className="px-6 py-4 text-sm">{s.ci}</td>
                                <td className="px-6 py-4 text-sm">{s.nivel}</td>
                                <td className="px-6 py-4 text-sm">{s.grado}</td>
                                <td className="px-6 py-4 text-sm">{s.estado}</td>
                                <td className="px-6 py-4 text-sm">{s.nota}</td>
                                <td className="px-6 py-4 text-sm">{s.descripcion}</td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </ComponentCard>
        </>
    )
}
