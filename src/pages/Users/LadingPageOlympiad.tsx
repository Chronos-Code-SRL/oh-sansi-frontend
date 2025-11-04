import { BoxOlympiad } from "../../components/common/BoxOlympiad"


const LadingPage = () => {
    return (
        <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="mt-6 mb-2 text-center text-4xl font-semibold">Oh sansi Olimpiadas</h1>
                <p className="mb-8 text-center text-muted-foreground">
                    Seleccione una olimpiada que desea calificar o gestionar a los competidores.
                </p>
                <div className="grid  auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <BoxOlympiad
                        key={1} // Clave única para cada elemento
                        id={1} // Pasamos el ID de la olimpiada
                        name={"Olimpiada 1"} // Pasamos el nombre de la olimpiada
                        status={"active"} // Pasamos el estado
                        startDate={"2023-01-01"} // Pasamos la fecha de inicio
                        endDate={"2023-12-31"} // Pasamos la fecha de fin
                        areas={["Matemáticas", "ísica", "Química", "Biología", "Astronomía",
                            "Informatica", "Robotica"
                        ]} // Pasamos las áreas
                    />
                    <BoxOlympiad
                        key={1} // Clave única para cada elemento
                        id={1} // Pasamos el ID de la olimpiada
                        name={"Olimpiada 1 oh sansi 2025"} // Pasamos el nombre de la olimpiada
                        status={"active"} // Pasamos el estado
                        startDate={"2023-01-01"} // Pasamos la fecha de inicio
                        endDate={"2023-12-31"} // Pasamos la fecha de fin
                        areas={["Matemáticas", "Ciencias", "Historia"]} // Pasamos las áreas
                    />
                    <BoxOlympiad
                        key={1} // Clave única para cada elemento
                        id={1} // Pasamos el ID de la olimpiada
                        name={"Olimpiada infantil 2025 ohsansi"} // Pasamos el nombre de la olimpiada
                        status={"active"} // Pasamos el estado
                        startDate={"2023-01-01"} // Pasamos la fecha de inicio
                        endDate={"2023-12-31"} // Pasamos la fecha de fin
                        areas={["Matemáticas", "Ciencias", "Historia"]} // Pasamos las áreas
                    />
                    <BoxOlympiad
                        key={1} // Clave única para cada elemento
                        id={1} // Pasamos el ID de la olimpiada
                        name={"Olimpiada 1"} // Pasamos el nombre de la olimpiada
                        status={"active"} // Pasamos el estado
                        startDate={"2023-01-01"} // Pasamos la fecha de inicio
                        endDate={"2023-12-31"} // Pasamos la fecha de fin
                        areas={["Matemáticas", "Ciencias", "Historia"]} // Pasamos las áreas
                    />
                    <BoxOlympiad
                        key={1} // Clave única para cada elemento
                        id={1} // Pasamos el ID de la olimpiada
                        name={"Olimpiada 1"} // Pasamos el nombre de la olimpiada
                        status={"active"} // Pasamos el estado
                        startDate={"2023-01-01"} // Pasamos la fecha de inicio
                        endDate={"2023-12-31"} // Pasamos la fecha de fin
                        areas={["Matemáticas", "Ciencias", "Historia"]} // Pasamos las áreas
                    />
                    <BoxOlympiad
                        key={1} // Clave única para cada elemento
                        id={1} // Pasamos el ID de la olimpiada
                        name={"Olimpiada 1"} // Pasamos el nombre de la olimpiada
                        status={"active"} // Pasamos el estado
                        startDate={"2023-01-01"} // Pasamos la fecha de inicio
                        endDate={"2023-12-31"} // Pasamos la fecha de fin
                        areas={["Matemáticas", "Ciencias", "Historia"]} // Pasamos las áreas
                    />
                    <BoxOlympiad
                        key={1} // Clave única para cada elemento
                        id={1} // Pasamos el ID de la olimpiada
                        name={"Olimpiada 1"} // Pasamos el nombre de la olimpiada
                        status={"active"} // Pasamos el estado
                        startDate={"2023-01-01"} // Pasamos la fecha de inicio
                        endDate={"2023-12-31"} // Pasamos la fecha de fin
                        areas={["Matemáticas", "Ciencias", "Historia"]} // Pasamos las áreas
                    /><BoxOlympiad
                        key={1} // Clave única para cada elemento
                        id={1} // Pasamos el ID de la olimpiada
                        name={"Olimpiada 1"} // Pasamos el nombre de la olimpiada
                        status={"active"} // Pasamos el estado
                        startDate={"2023-01-01"} // Pasamos la fecha de inicio
                        endDate={"2023-12-31"} // Pasamos la fecha de fin
                        areas={["Matemáticas", "Ciencias", "Historia"]} // Pasamos las áreas
                    />


                </div>
            </div>

        </>
    )
}


export default LadingPage


