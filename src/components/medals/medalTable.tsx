import { useEffect, useRef, useState } from "react";
import Select from "../form/Select";
import SearchBar from "../Grade/Searcher";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import { getAreasFromUserOlympiads } from "../../api/services/olympiadService";
import { Area } from "../../types/Area";
import { Level } from "../../types/Level";
import { getLevelsByOlympiadAndArea } from "../../api/services/levelGradesService";
import { getContestantMedals, updateMedal, awardMedals } from "../../api/services/contestantService";
import { ContestantMedal } from "../../types/Contestant";
import type { ClassificationLabel } from "./MedalSelector";
import Alert from "../ui/alert/Alert";

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

    const [students, setStudents] = useState<ContestantMedal[]>([]);
    const [savingRow, setSavingRow] = useState<number | null>(null);
    
    // Medal form states
    const [goldCount, setGoldCount] = useState("");
    const [silverCount, setSilverCount] = useState("");
    const [bronzeCount, setBronzeCount] = useState("");
    const [honorableMentionCount, setHonorableMentionCount] = useState("");
    const [isSubmittingMedals, setIsSubmittingMedals] = useState(false);
    
    // Alert states
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [alertVariant, setAlertVariant] = useState<"success" | "error" | "warning" | "info">("success");
    const autoHideTimerRef = useRef<number | null>(null);

    type SelectedOlympiad = {
        id: number;
        name: string;
        status: string;
    };
    const [selectedOlympiad, setSelectedOlympiad] = useState<SelectedOlympiad | null>(() => {
        const stored = localStorage.getItem("selectedOlympiad");
        return stored ? (JSON.parse(stored) as SelectedOlympiad) : null;
    });


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

    useEffect(() => {
        setLoading(true);
        const t = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(t);
    }, []);

    // Cargar concursantes cuando hay área, nivel y olimpiada
    useEffect(() => {
        let alive = true;

        async function fetchContestants() {
            const idOlympiad = selectedOlympiad?.id ?? 0;
            const idArea = selectedAreaId ?? 0;
            const levelId = selectedLevelId ?? 0;

            if (idOlympiad === 0 || idArea === 0 || levelId === 0) {
                if (alive) setStudents([]);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const data = await getContestantMedals(idOlympiad, idArea, levelId);
                setStudents(sortStudentsByMedal(data));
            } catch (e) {
                if (alive) {
                    setStudents([]);
                    setError("No se pudieron cargar los competidores.");
                }
            } finally {
                if (alive) setLoading(false);
            }
        }
        fetchContestants();
        return () => {
            alive = false;
        };
    }, [selectedAreaId, selectedLevelId, selectedOlympiad?.id]);
    console.log("Deberiamos imprimir los estudiantes", students);

    const normalize = (text: string) =>
        text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filteredStudents = students.filter((s) => {
        const q = normalize(searchQuery);
        const matchesSearch =
            normalize(s.first_name).includes(q) ||
            normalize(s.last_name).includes(q) ||
            s.ci_document.toString().includes(q);
             return matchesSearch ;
    });

    async function handleMedalChange(evaluationId: number, newPlace: ClassificationLabel | null) {
        const student = students.find(s => s.evaluation_id === evaluationId);
        const fullName = student ? `${student.first_name} ${student.last_name}` : `evaluación ${evaluationId}`;
        setSavingRow(evaluationId);
        setStudents(prev => sortStudentsByMedal(prev.map(st => st.evaluation_id === evaluationId ? { ...st, classification_place: newPlace } : st)));
        try {
            await updateMedal(evaluationId, { classification_place: newPlace });
            const placeText = newPlace ?? "Sin asignar";
            showAlert("Medallero actualizado", `La posición es: ${placeText} para ${fullName}`, "success");
        } catch (err) {
            showAlert("Error al guardar", "No se pudo guardar la posición.", "error");
            try {
                const current = students.find(s => s.evaluation_id === evaluationId);
                if (!current) return;
                const idOlympiad = selectedOlympiad?.id ?? 0;
                const idArea = selectedAreaId ?? 0;
                const levelId = selectedLevelId ?? 0;
                if (idOlympiad && idArea && levelId) {
                    const data = await getContestantMedals(idOlympiad, idArea, levelId);
                    setStudents(sortStudentsByMedal(data));
                }
            } catch {
            }
        } finally {
            setSavingRow(null);
        }
    }

    function sortStudentsByMedal(list: ContestantMedal[]): ContestantMedal[] {
        const medalOrder: Record<string, number> = {
            "Oro": 1,
            "Plata": 2,
            "Bronce": 3,
            "Mención honorífica": 4,
            "Mención de Honor": 4,
        };
        return [...list].sort((a, b) => {
            const mA = medalOrder[a.classification_place ?? ""] ?? 99;
            const mB = medalOrder[b.classification_place ?? ""] ?? 99;
            if (mA !== mB) return mA - mB;
            const sA = typeof a.score === "number" ? a.score : -Infinity;
            const sB = typeof b.score === "number" ? b.score : -Infinity;
            return sB - sA;
        });
    }

    function showAlert(title: string, message: string, variant: "success" | "error" | "warning" | "info") {
        if (autoHideTimerRef.current !== null) {
            window.clearTimeout(autoHideTimerRef.current);
            autoHideTimerRef.current = null;
        }
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVariant(variant);
        setAlertOpen(true);
        autoHideTimerRef.current = window.setTimeout(() => {
            setAlertOpen(false);
            autoHideTimerRef.current = null;
        }, 4000);
    }

    async function handleGenerateMedals() {
        const idOlympiad = selectedOlympiad?.id ?? 0;
        const idArea = selectedAreaId ?? 0;
        const levelId = selectedLevelId ?? 0;

        if (idOlympiad === 0 || idArea === 0 || levelId === 0) {
            showAlert("Campos incompletos", "Debe seleccionar una olimpiada, área y nivel.", "warning");
            return;
        }

        if (!goldCount && !silverCount && !bronzeCount && !honorableMentionCount) {
            showAlert("Campos vacíos", "Debe ingresar al menos una cantidad de medallas.", "warning");
            return;
        }

        setIsSubmittingMedals(true);
        try {
            const response = await awardMedals(idOlympiad, idArea, levelId, {
                gold: goldCount || "0",
                silver: silverCount || "0",
                bronze: bronzeCount || "0",
                honorable_mention: honorableMentionCount || "0",
            });
            
            showAlert("Medallero generado", response.message, "success");
            
            // Recargar la tabla de estudiantes
            const data = await getContestantMedals(idOlympiad, idArea, levelId);
            setStudents(sortStudentsByMedal(data));
            
            // Limpiar el formulario
            setGoldCount("");
            setSilverCount("");
            setBronzeCount("");
            setHonorableMentionCount("");
        } catch (error) {
            showAlert("Error", "No se pudo generar el medallero. Intente nuevamente.", "error");
        } finally {
            setIsSubmittingMedals(false);
        }
    }

    useEffect(() => {
        return () => {
            if (autoHideTimerRef.current !== null) {
                window.clearTimeout(autoHideTimerRef.current);
                autoHideTimerRef.current = null;
            }
        };
    }, []);
    return (
        <>
            {alertOpen && (
                <div className="pointer-events-auto" role="alert" aria-live="polite">
                    <Alert
                        variant={alertVariant}
                        title={alertTitle}
                        message={alertMessage}
                    />
                </div>
            )}

            {/* Gestión de Medallas Form */}
            <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestión de Medallas</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Oro */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <span className="inline-flex items-center gap-2">
                                <span className="text-yellow-500">🏆</span>
                                Medallas de Oro
                            </span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={goldCount}
                            onChange={(e) => setGoldCount(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>

                    {/* Plata */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <span className="inline-flex items-center gap-2">
                                <span className="text-gray-400">🥈</span>
                                Medallas de Plata
                            </span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={silverCount}
                            onChange={(e) => setSilverCount(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>

                    {/* Bronce */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <span className="inline-flex items-center gap-2">
                                <span className="text-orange-600">🥉</span>
                                Medallas de Bronce
                            </span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={bronzeCount}
                            onChange={(e) => setBronzeCount(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>

                    {/* Mención Honorífica */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <span className="inline-flex items-center gap-2">
                                <span className="text-purple-500">🎖️</span>
                                Mención Honorífica
                            </span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={honorableMentionCount}
                            onChange={(e) => setHonorableMentionCount(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>
                </div>

                <button
                    onClick={handleGenerateMedals}
                    disabled={isSubmittingMedals || !selectedAreaId || !selectedLevelId}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                    {isSubmittingMedals ? "Generando..." : "Generar Medallero"}
                </button>
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 min-w-0">
                    <Select
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

            <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <div className="max-w-full overflow-x-auto"></div>
                <Table className="min-w-full border border-gray-200 rounded-lg text-sm text-left">
                    <TableHeader className="bg-gray-100 border-b border-border bg-muted/50">
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
                        {!loading && !error && filteredStudents.map((s) => (
                            <TableRow key={s.evaluation_id} className="border-b border-border last:border-0">
                                {[
                                    <td key="fn" className="px-6 py-4 text-sm text-center">{s.first_name}</td>,
                                    <td key="ln" className="px-6 py-4 text-sm text-center">{s.last_name}</td>,
                                    <td key="sch" className="px-6 py-4 text-sm text-center">{s.school_name}</td>,
                                    <td key="area" className="px-6 py-4 text-sm text-center">{s.level_name ?? "—"}</td>,
                                    <td key="lvl" className="px-6 py-4 text-sm text-center">{s.level_name}</td>,
                                    <td key="score" className="px-6 py-4 text-sm text-center">{typeof s.score === "number" ? s.score : "—"}</td>,
                                    <td key="medal" className="px-6 py-4 text-sm text-center">{s.classification_place as string | null}</td>,
                                ]}
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>

            </div>
        </>
    )
}