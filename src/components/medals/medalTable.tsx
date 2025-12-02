import { useEffect, useRef, useState } from "react";
import Select from "../form/Select";
import SearchBar from "../Grade/Searcher";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import { getAreasFromUserOlympiads } from "../../api/services/olympiadService";
import { Area } from "../../types/Area";
import { Level } from "../../types/Level";
import { getLevelsByOlympiadAndArea } from "../../api/services/levelGradesService";
import { getContestantMedals, awardMedals, getLastPhaseStatus } from "../../api/services/contestantService";
import { ContestantMedal } from "../../types/Contestant";
import Alert from "../ui/alert/Alert";
import MedalManagementForm from "./MedalManagementForm";

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

    // Estados para validación de última fase
    const [isLastPhaseEndorsed, setIsLastPhaseEndorsed] = useState<boolean>(false);
    const [phaseStatusChecked, setPhaseStatusChecked] = useState<boolean>(false);

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

    // Cargar concursantes cuando hay área, nivel y olimpiada, Primero valida con getLastPhaseStatus, 
    // LUEGO carga estudiantes
    useEffect(() => {
        let alive = true;

        async function fetchContestants() {
            const idOlympiad = selectedOlympiad?.id ?? 0;
            const idArea = selectedAreaId ?? 0;
            const levelId = selectedLevelId ?? 0;

            if (idOlympiad === 0 || idArea === 0 || levelId === 0) {
                if (alive) {
                    setStudents([]);
                    setIsLastPhaseEndorsed(false);
                    setPhaseStatusChecked(false);
                }
                return;
            }
            try {
                setLoading(true);
                setError(null);
                setPhaseStatusChecked(false);
                setIsLastPhaseEndorsed(false);

                // PASO 1: Validar el estado de la última fase
                const phaseStatusResponse = await getLastPhaseStatus(idOlympiad, idArea, levelId);

                if (!alive) return;

                // Si llega aquí, la respuesta fue exitosa (200)
                setIsLastPhaseEndorsed(true);
                setPhaseStatusChecked(true);

                // PASO 2: Cargar los estudiantes
                const data = await getContestantMedals(idOlympiad, idArea, levelId);
                if (alive) setStudents(data);

            } catch (error: any) {
                if (!alive) return;
                if (error?.response?.status === 403) {
                    // 403: La última fase no está avalada
                    setIsLastPhaseEndorsed(false);
                    setPhaseStatusChecked(true);
                    setStudents([]);
                }
                else {
                    // Otro tipo de error (red, servidor, etc.)
                    console.error("Error al validar fase:", error);
                    setIsLastPhaseEndorsed(false);
                    setPhaseStatusChecked(true);
                    setStudents([]);
                    showAlert(
                        "Error de validación",
                        "No se pudo verificar el estado de la última fase.",
                        "error"
                    );
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

    const normalize = (text: string) =>
        text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filteredStudents = students.filter((s) => {
        const q = normalize(searchQuery);
        const matchesSearch =
            normalize(s.first_name).includes(q) ||
            normalize(s.last_name).includes(q) ||
            s.ci_document.toString().includes(q);
        return matchesSearch;
    });

    function showAlert(title: string, message: string, variant: "success" | "error" | "warning" | "info" = "success"): void {
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

    async function handleGenerateMedals(medals: {
        gold: string;
        silver: string;
        bronze: string;
        honorable_mention: string;
    }) {
        const idOlympiad = selectedOlympiad?.id ?? 0;
        const idArea = selectedAreaId ?? 0;
        const levelId = selectedLevelId ?? 0;

        if (idOlympiad === 0 || idArea === 0 || levelId === 0) {
            showAlert("Campos incompletos", "Debe seleccionar una olimpiada, área y nivel.", "warning");
            return;
        }

        try {
            const response = await awardMedals(idOlympiad, idArea, levelId, medals);

            showAlert("Medallero generado", response.message, "success");

            // Recargar la tabla de estudiantes
            const data = await getContestantMedals(idOlympiad, idArea, levelId);
            setStudents(data);
        } catch (error) {
            showAlert("Error", "No se pudo generar el medallero. Intente nuevamente.", "error");
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
                            if (!value) {
                                setSelectedAreaId(null);
                                setSelectedLevelId(null);
                                return;
                            }
                            const num = Number(value);
                            if (!Number.isNaN(num)) {
                                setSelectedAreaId(num);
                                setSelectedLevelId(null);
                            }
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
                        disabled={selectedAreaId === null}
                    />
                </div>
            </div>

            {/* Mensaje cuando la fase no está avalada */}
            {selectedAreaId !== null && selectedLevelId !== null && phaseStatusChecked && !isLastPhaseEndorsed && (
                <div className="mt-6">
                    <Alert
                        variant="warning"
                        title="Fase no avalada"
                        message={`La última fase de ${areas.find(a => a.id === selectedAreaId)?.name || 'esta área'} - ${levels.find(l => l.id === selectedLevelId)?.name || 'este nivel'} aún no ha sido avalada. No se pueden generar medallas hasta que se avale la fase.`}
                    />
                </div>
            )}

            {selectedAreaId !== null && selectedLevelId !== null && phaseStatusChecked && isLastPhaseEndorsed && (
                <>
                    {/* Gestión de Medallas Form */}
                    <MedalManagementForm
                        selectedAreaId={selectedAreaId}
                        selectedLevelId={selectedLevelId}
                        onGenerateMedals={handleGenerateMedals}
                        onShowAlert={showAlert}
                    />
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
            )}

            {alertOpen && (
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
            )}
        </>
    )
}
