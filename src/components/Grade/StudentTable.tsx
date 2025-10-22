import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import { fetchStudents, Student } from "../../api/services/studentService";
import Badge from "../ui/badge/Badge";


export default function TableStudent() {

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;

        async function cargarEstudiantes() {
            try {
                const data = await fetchStudents();
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

    return (
        <>
            <ComponentCard title="Quimica">
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
                        {!loading && !error && students.map((s) => (
                            <tr key={s.ci} className="border-b border-border last:border-0">
                                <td className="px-6 py-4 text-sm">{s.nombre}</td>
                                <td className="px-6 py-4 text-sm">{s.apellido}</td>
                                <td className="px-6 py-4 text-sm">{s.ci}</td>
                                <td className="px-6 py-4 text-sm">{s.nivel}</td>
                                <td className="px-6 py-4 text-sm">{s.grado}</td>
                                <td className="px-6 py-4 text-sm">
                                    <Badge color={s.estado === "Evaluado" ? "success" : "error"}>
                                        {s.estado}
                                    </Badge>
                                </td>
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
