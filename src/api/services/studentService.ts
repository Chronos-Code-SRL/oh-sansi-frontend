export interface Student {
    nombre: string;
    apellido: string;
    ci: string;
    nivel: 'Primaria' | 'Secundaria' | string;
    grado: string;
    estado: 'Activo' | 'Inactivo' | string;
    nota: number | null;
    descripcion: string;
}

const mockStudents: Student[] = [
    {
        nombre: "Ana",
        apellido: "López",
        ci: "4923456",
        nivel: "Primaria",
        grado: "3°",
        estado: "Evaluado",
        nota: 88,
        descripcion: "Cumple tareas y participa en clase."
    },
    {
        nombre: "Carlos",
        apellido: "González",
        ci: "7312098",
        nivel: "Secundaria",
        grado: "1°",
        estado: "Evaluado",
        nota: 73,
        descripcion: "Buen desempeño general."
    },
    {
        nombre: "María",
        apellido: "Fernández",
        ci: "5689012",
        nivel: "Primaria",
        grado: "5°",
        estado: "Evaluado",
        nota: null,
        descripcion: "Excelente rendimiento."
    },
    {
        nombre: "Jorge",
        apellido: "Ramírez",
        ci: "8045671",
        nivel: "Secundaria",
        grado: "3°",
        estado: "No evaluado",
        nota: 61,
        descripcion: "Pendiente de regularización."
    },
    {
        nombre: "Lucía",
        apellido: "Martínez",
        ci: "6123450",
        nivel: "Primaria",
        grado: "1°",
        estado: "No evaluado",
        nota: 82,
        descripcion: "Avances constantes."
    },
    {
        nombre: "Diego",
        apellido: "Benítez",
        ci: "7098123",
        nivel: "Secundaria",
        grado: "2°",
        estado: "No evaluado",
        nota: null,
        descripcion: "Mejora en trabajos prácticos."
    },
    {
        nombre: "Sofía",
        apellido: "Cabrera",
        ci: "4901765",
        nivel: "Primaria",
        grado: "6°",
        estado: "Evaluado",
        nota: 90,
        descripcion: "Destaca en matemáticas."
    },
    {
        nombre: "Pedro",
        apellido: "Vera",
        ci: "8350192",
        nivel: "Secundaria",
        grado: "1°",
        estado: "Evaluado",
        nota: 68,
        descripcion: "Necesita participar más."
    },
    {
        nombre: "Camila",
        apellido: "Torres",
        ci: "5203984",
        nivel: "Primaria",
        grado: "4°",
        estado: "No evaluado",
        nota: null,
        descripcion: "Ordenada y responsable."
    },
    {
        nombre: "Miguel",
        apellido: "Rojas",
        ci: "7776543",
        nivel: "Secundaria",
        grado: "3°",
        estado: "Evaluado",
        nota: null,
        descripcion: "Buen trabajo en equipo."
    }
];

export function fetchStudents(): Promise<Student[]> {
    // Simula una llamada HTTP con latencia
    return new Promise((resolve) => {
        setTimeout(() => resolve(mockStudents), 800);
    });
}