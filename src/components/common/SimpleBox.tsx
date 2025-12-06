import { useNavigate } from "react-router";
import Badge from "../ui/badge/Badge"
import { useState } from "react";
import Button from "../ui/button/Button"

import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon, PencilIcon, TrashBinIcon, CheckLineIcon, CloseLineIcon } from "../../icons";
interface SimpleBoxProps {
    id: number; //Para que pasemo el ID Como parametro id tiene que ser obligario
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    areas: string[];    
    onEdit?: (id: number) => void;
    onToggleActive?: (id: number) => void;
    //onDelete?: (id: number) => void;
}

export const SimpleBox: React.FC<SimpleBoxProps> = ({ id, name, status, startDate, endDate, areas, onEdit, onToggleActive}) => {
    const navigate = useNavigate(); // Hook para manejar la navegación
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Función para manejar el clic en el botón
    const handleButtonClick = () => {
        // Redirigimos a la página de registro con el id de la olimpiada
        navigate(`/OlimpiadaAreas/${id}`);
    };

    return (

         <div className="bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow 
                    flex flex-col justify-between h-full min-h-[300px]">
            <div className="flex items-start justify-between mb-3 relative">
                <h3 className="text-lg font-semibold text-card-foreground leading-tight">
                    {/* Aca tenemos que consumir de la Api el nombre de la olimpiada */}
                    {name}
                </h3>
                <div className="flex items-center gap-2">
                    <Badge color={status === "Activa" ? "success" : "error"}>
                        {status}
                    </Badge>

                    {/* Botón de 3 puntos */}
                    <button
                        type="button"
                        className="dropdown-toggle inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition focus:outline-none"
                        onClick={() => setIsMenuOpen((v) => !v)}
                        aria-label="Opciones"
                    >
                        <MoreDotIcon className="h-5 w-5" />
                    </button>

                    {/* Menú desplegable */}
                    <Dropdown isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
                        <div className="w-56 py-2">
                            {/* Activar*/}
                            <DropdownItem
                                onItemClick={() => {
                                    setIsMenuOpen(false);
                                    onToggleActive?.(id);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                {
                                    <>
                                        <CheckLineIcon className="h-4 w-4" />
                                        <span>Activar olimpiada</span>
                                    </>
                                }
                            </DropdownItem>

                            {/* Editar
                            {onEdit && (
                                <DropdownItem
                                    onItemClick={() => {
                                        setIsMenuOpen(false);
                                        onEdit(id);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <PencilIcon className="h-4 w-4" />
                                    <span>Editar olimpiada</span>
                                </DropdownItem>
                            )}

                            {/* Eliminar (placeholder)
                            <DropdownItem
                                onItemClick={() => {
                                    setIsMenuOpen(false);
                                    // TODO: manejar eliminación si es necesario
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <TrashBinIcon className="h-4 w-4" />
                                <span>Eliminar olimpiada</span>
                            </DropdownItem> */}
                        </div>
                    </Dropdown>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-sm font-medium text-gray-800 mb-1">Fechas:</p>
                <p className="text-sm ">
                    {startDate} - {endDate}  {/*Aca tengo que consumir de la Api las fechas para ponerlo*/}
                </p>
            </div>

             <div className="mb-5">
                <p className="text-sm font-medium text-card-foreground mb-2">
                    Áreas asignadas:
                </p>
                <div className="flex flex-wrap gap-2">

                    {/*Aca tengo que consumir de la Api todas las areas que tiene esa olimpiada y se tiene que automatizar en poner
                     los n areas para y solo usar un Badge y talves usar el Map*/}
                    {areas.map((area, index) => (
                        <Badge key={index} color="light">
                            {area}
                        </Badge>
                    ))}
                </div>
            </div>
            <div className="flex justify-end">
                <Button size="sm"
                    onClick={handleButtonClick}
                >
                    Configurar Áreas
                </Button>
            </div>

        </div>

    )
}

