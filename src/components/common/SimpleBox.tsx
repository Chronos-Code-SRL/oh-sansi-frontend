import Badge from "../ui/badge/Badge"
import Button from "../ui/button/Button"



export const SimpleBox = () => {

    return (

        <div className="bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-card-foreground leading-tight">
                    {/* Aca tenemos que consumir de la Api el nombre de la olimpiada */}
                    Olimpiada Nacional de Matemáticas 2024
                </h3>
                <Badge color="error">Inactivo</Badge>  {/*Aca tengo que consumir de la Api si esta activo o inactivo */}
            </div>


            <div className="mb-4">
                <p className="text-sm font-medium text-gray-800 mb-1">Fechas:</p>
                <p className="text-sm ">
                    14/3/2024 - 29/6/2024  {/*Aca tengo que consumir de la Api las fechas para ponerlo*/}
                </p>
            </div>

            <div className="mb-5">
                <p className="text-sm font-medium text-card-foreground mb-2">
                    Áreas asignadas:
                </p>
                <div className="flex flex-wrap gap-2">
                    {/*Aca tengo que consumir de la Api todas las areas que tiene esa olimpiada y se tiene que automatizar en poner
                     los n areas para y solo usar un Badge y talves usar el Map*/}
                    <Badge color="light">Matemática</Badge>
                    <Badge color="light">Matematica</Badge>
                    <Badge color="light">Matematica</Badge>
                    <Badge color="light">Matematica</Badge>
                </div>
            </div>
            <div>
                <Button size="sm" className="w-full text-white font-medium py-2.5 disabled:opacity-50 disabled:cursor-not-allowed" >
                    Configurar Areas
                </Button>
            </div>

        </div>

    )
}

