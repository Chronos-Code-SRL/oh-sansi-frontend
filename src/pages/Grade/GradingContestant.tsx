import PageMeta from "../../components/common/PageMeta";
import StudentTable from "../../components/Grade/StudentTable";


export default function MarksStudents() {
    return (
        <>
            <PageMeta
                title={"Calificaciones de Estudiantes"}
                description={"En esta sección puedes ver y gestionar las calificaciones de los estudiantes."}
            />
            <StudentTable />
        </>
    )
}

