import { useEffect, useState } from "react";
import Select from "../form/Select";
import SearchBar from "../Grade/Searcher";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import { getAreasFromUserOlympiads } from "../../api/services/olympiadService";
import { Area } from "../../types/Area";
import { Level } from "../../types/Level";
import { getLevelsByOlympiadAndArea } from "../../api/services/levelGradesService";

export default function MedalsPage() {

    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Datos hardcodeados (mock)
    const [areas, setAreas] = useState<Area[]>([]);
    const [areasLoading, setAreasLoading] = useState(false);
    const [areasError, setAreasError] = useState<string | null>(null);

    const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);

    const [levels, setLevels] = useState<Level[]>([]);
    const [levelsLoading, setLevelsLoading] = useState(false);
    const [levelsError, setLevelsError] = useState<string | null>(null);
    const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
    type SelectedOlympiad = {
        id: number;
        name: string;
        status: string;
    };
    const [selectedOlympiad, setSelectedOlympiad] = useState<SelectedOlympiad | null>(() => {
        const stored = localStorage.getItem("selectedOlympiad");
        return stored ? (JSON.parse(stored) as SelectedOlympiad) : null;
    });

    type Medal =
        | "oro"
        | "plata"
        | "bronce"
        | "mencion"
        | "none"; // Sin medalla

    type MedalStudent = {
        contestant_id: number;
        first_name: string;
        last_name: string;
        colegio: string;       // Unidad Educativa
        area_name?: string;    // Area (para alinear con header)
        level_name: string;    // Nivel
        status: boolean;
        score: number | null;  // Nota
        description: string | null; // Posición
    };

    const medalOptions: { value: Medal; label: string; icon: string }[] = [
        { value: "oro", label: "Oro", icon: "🏆" },
        { value: "plata", label: "Plata", icon: "🥈" },
        { value: "bronce", label: "Bronce", icon: "🥉" },
        { value: "mencion", label: "Mención de Honor", icon: "🎖️" },
        { value: "none", label: "Sin medalla", icon: "⚪" },
    ];

    // Mapea medal -> texto visible si quieres también un tooltip/description
    const medalToDescription: Record<Medal, string | null> = {
        oro: "1er lugar",
        plata: "2do lugar",
        bronce: "3er lugar",
        mencion: "Participación destacada",
        none: null,
    };

    const [students, setStudents] = useState<MedalStudent[]>([
        {
            contestant_id: 1,
            first_name: "Ana",
            last_name: "Gómez",
            colegio: "Unidad Educativa Central",
            area_name: "Matemática",
            level_name: "Nivel 1",
            status: true,
            score: 256,
            description: "1er lugar",
        },
        {
            contestant_id: 2,
            first_name: "Luis",
            last_name: "Pérez",
            colegio: "Colegio Libertad",
            area_name: "Matemática",
            level_name: "Nivel 1",
            status: true,
            score: 240,
            description: "2do lugar",
        },
        {
            contestant_id: 3,
            first_name: "María",
            last_name: "Vargas",
            colegio: "Colegio Libertad",
            area_name: "Matemática",
            level_name: "Nivel 1",
            status: true,
            score: 230,
            description: "3er lugar",
        },
        {
            contestant_id: 4,
            first_name: "José",
            last_name: "Rojas",
            colegio: "Unidad Educativa Central",
            area_name: "Física",
            level_name: "Nivel 2",
            status: false,
            score: null,
            description: null,
        },
        {
            contestant_id: 5,
            first_name: "Carla",
            last_name: "Fernández",
            colegio: "Instituto Alfa",
            area_name: "Química",
            level_name: "Nivel 2",
            status: true,
            score: 190,
            description: "Participación destacada",
        },
    ]);

    // For the areas Select
    useEffect(() => {
        const fetchAreas = async () => {
            try {
                setAreasLoading(true);
                const data = await getAreasFromUserOlympiads(); // Promise<Area[]>
                setAreas(data);
                setAreasError(null);
            } catch {
                setAreasError("No hay Olimpiadas creadas. Cree una olimpiada por favor");
            } finally {
                setAreasLoading(false);
            }
        };
        fetchAreas();
    }, []);
    useEffect(() => {
        let alive = true;
        async function fetchLevels() {
            if (selectedAreaId == null) {
                if (alive) {
                    setLevels([]);
                    setLevelsError(null);
                    setLevelsLoading(false);
                }
                return;
            }
            setLevelsLoading(true);
            setLevelsError(null);
            try {
                const data = await getLevelsByOlympiadAndArea(selectedOlympiad?.id ?? 0, selectedAreaId);
                if (alive) setLevels(data as Level[]);
            } catch {
                if (alive) setLevelsError("No se pudieron cargar los niveles.");
            } finally {
                if (alive) setLevelsLoading(false);
            }
        }
        fetchLevels();
        return () => { alive = false; };
    }, [selectedAreaId, selectedOlympiad?.id]);

    console.log(areas);

    useEffect(() => {
        setLoading(true);
        const t = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(t);
    }, []);

    const normalize = (t: string) =>
        t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filtered = students.filter((s) =>
        [s.first_name, s.last_name, s.colegio].some((v) =>
            normalize(v).includes(normalize(searchQuery))
        )
    );
    useEffect(() => {
        setSelectedLevelId(null);
        setLevels([]);
    }, [selectedAreaId]);

    const handleChangeMedal = (id: number, medal: Medal) => {
        setStudents((prev) =>
            prev.map((st) =>
                st.contestant_id === id
                    ? { ...st, medal, description: medalToDescription[medal] }
                    : st
            )
        );
    };
    return (
        <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 min-w-0">
                    <Select
                        //className="w-full" // si tu Select no acepta className, el wrapper ya fuerza el ancho
                        placeholder="Seleccione un área"
                        options={areas.map(l => ({
                            value: String(l.id),
                            label: l.name || `Área ${l.id}`,
                        }))}
                        value={selectedAreaId == null ? "" : String(selectedAreaId)}
                        onChange={(value: string) => {
                            if (!value) { setSelectedAreaId(null); return; }
                            const num = Number(value);
                            if (!Number.isNaN(num)) setSelectedAreaId(num);
                        }}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <Select
                        //className="w-full"
                        placeholder="Seleccione un nivel"
                        options={levels.map(l => ({
                            value: String(l.id),
                            label: l.name || `Nivel ${l.id}`,
                        }))}
                        value={selectedLevelId == null ? "" : String(selectedLevelId)}
                        onChange={(value: string) => {
                            if (!value) { setSelectedLevelId(null); return; }
                            const num = Number(value);
                            if (!Number.isNaN(num)) setSelectedLevelId(num);
                        }}
                    />
                </div>
            </div>
            <div className="flex items-center mb-3">
                <SearchBar
                    onSearch={setSearchQuery}
                    placeholder="Buscar por nombre, apellido o CI..."
                />
            </div>

            <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto"></div>
                <Table className="rounded-xl">
                    <TableHeader className="bg-gray-100 ">
                        <TableRow>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Nombre</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Apellido</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Unidad Educativa</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Area</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Nivel</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Nota</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Pocisión</th>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                {/* Header tiene 7 columnas -> usa colSpan={7} */}
                                <td colSpan={7} className="px-6 py-4 text-center text-sm text-foreground">Cargando...</td>
                            </TableRow>
                        )}
                        {error && !loading && (
                            <TableRow>
                                <td colSpan={7} className="px-6 py-4 text-center text-sm text-red-600">{error}</td>
                            </TableRow>
                        )}
                        {/* {selectedLevelId === null && (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Por favor, seleccione un nivel para ver los estudiantes.
                                </td>
                            </tr>
                        )} */}
                        {/* {!loading && !error && filteredStudents.map((s) => {
                            // const isEditing = editingCi === s.ci_document;
                            return (
                                <TableRow key={s.contestant_id} className="border-b border-border last:border-0">
                                    <td className="px-6 py-4 text-sm text-center">{s.first_name}</td>
                                    <td className="px-6 py-4 text-sm text-center">{s.last_name}</td>
                                    <td className="px-6 py-4 text-sm text-center">{s.ci_document}</td>
                                    <td className="px-6 py-4 text-sm text-center">{s.level_name}</td>
                                    <td className="px-6 py-4 text-sm text-center">{s.grade_name}</td>
                                    <td className="px-6 py-4 text-sm text-center">{s.status}</td>
                                    <td className="px-6 py-4 text-sm text-center">{s.score}</td>
                                </TableRow>
                            );
                        })} */}
                        {/* {!loading && !error && filteredStudents.map((s) => {
                            // const isEditing = editingCi === s.ci_document;
                            return (
                                <TableRow key={s.contestant_id} className="border-b border-border last:border-0">
                                    <td className="px-6 py-4 text-sm text-center">{s.first_name}</td>
                                    <td className="px-6 py-4 text-sm text-center">{s.last_name}</td>
                                    <td className="px-6 py-4 text-sm text-center">{s.ci_document}</td>
                                    <td className="px-6 py-4 text-sm text-center">{s.level_name}</td>
                                    <td className="px-6 py-4 text-sm text-center">{s.grade_name}</td>
                                    <td className="px-6 py-4 text-sm text-center">{s.status}</td>
                                    <td className="px-6 py-4 text-sm text-center">{s.score}</td>
                                </TableRow>
                            );
                        })} */}

                        {!loading && !error && students.map((s) => (
                            <TableRow key={s.contestant_id} className="border-b border-border last:border-0">
                                <td className="px-6 py-4 text-sm text-center">{s.first_name}</td>
                                <td className="px-6 py-4 text-sm text-center">{s.last_name}</td>
                                <td className="px-6 py-4 text-sm text-center">{s.colegio}</td>
                                <td className="px-6 py-4 text-sm text-center">{s.area_name ?? "—"}</td>     {/* Area */}
                                <td className="px-6 py-4 text-sm text-center">{s.level_name}</td>           {/* Nivel */}
                                <td className="px-6 py-4 text-sm text-center">
                                    {typeof s.score === "number" ? s.score : "—"}                              {/* Nota */}
                                </td>
                                <td className="px-6 py-4 text-sm text-center">
                                    <Select
                                        value={s.medal} // Medal
                                        options={medalOptions.map(m => ({
                                            value: m.value, // string union
                                            label: `${m.icon} ${m.label}`, // string
                                        }))}
                                        onChange={(val: string) => handleChangeMedal(s.contestant_id, val as Medal)}
                                        placeholder="Seleccione"
                                    />
                                    <div className="mt-1 text-xs text-gray-500">
                                        {s.description ?? (s.medal === "none" ? "Sin medalla" : "—")}
                                    </div>                        {/* Posición */}
                                </td>
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>

            </div>

            {/* {alertOpen && (
                <div
                    className="fixed bottom-6 right-6 z-[1000] w-[360px] max-w-[92vw] pointer-events-none"
                    role="presentation"
                >
                    <div className="pointer-events-auto" role="alert" aria-live="polite">
                        <Alert
                            variant={alertVariant}
                            title={alertTitle}
                            message={alertMessage}
                        />
                    </div>
                </div>
            )
            } */}


        </>
    )
}