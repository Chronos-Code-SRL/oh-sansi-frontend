import { useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import StudentTable from "../../components/Grade/StudentTable";


export default function MarksStudents() {
    function capitalizeFirst(str: string) {
        const s = str.trim();
        if (!s) return s;
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    const { areaName, areaId } = useParams<{ areaName?: string; areaId?: string }>();
    const baseTitle = areaName ? decodeURIComponent(areaName) : "Calificaciones";
    const title = capitalizeFirst(baseTitle);
    return (
        <>
            <PageMeta
                title={title}
                description={"En esta sección puedes ver y gestionar las calificaciones de los estudiantes."}
            />
            <ComponentCard key={areaId} title={title}>
                <StudentTable key={areaId} idArea={Number(areaId)} />
            </ComponentCard>
        </>
    )
}

