import React, { createContext, useContext, useState, useEffect, ReactNode, } from "react";

interface Olympiad {
    id: number;
    name: string;
    status: string;
    //startDate: string;
    //endDate: string;
    // areas: string[];
}

interface OlympiadContextType {
    selectedOlympiad: Olympiad | null;
    setSelectedOlympiad: (olympiad: Olympiad | null) => void;
    clearOlympiad: () => void;
}

const OlympiadContext = createContext<OlympiadContextType | undefined>(
    undefined
);

export const OlympiadProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [selectedOlympiad, setSelectedOlympiad] = useState<Olympiad | null>(
        null
    );

    // 🔹 Cargar desde localStorage cuando arranca la app
    useEffect(() => {
        const saved = localStorage.getItem("selectedOlympiad");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSelectedOlympiad(parsed);
            } catch (error) {
                console.error("Error al parsear la olimpiada guardada:", error);
            }
        }
    }, []);

    // 🔹 Guardar en localStorage cuando cambie
    useEffect(() => {
        if (selectedOlympiad) {
            localStorage.setItem(
                "selectedOlympiad",
                JSON.stringify(selectedOlympiad)
            );
        } else {
            localStorage.removeItem("selectedOlympiad");
        }
    }, [selectedOlympiad]);

    // 🔹 Función opcional para limpiar el valor (por ejemplo, al cerrar sesión)
    const clearOlympiad = () => {
        setSelectedOlympiad(null);
        localStorage.removeItem("selectedOlympiad");
    };

    return (
        <OlympiadContext.Provider
            value={{ selectedOlympiad, setSelectedOlympiad, clearOlympiad }}
        >
            {children}
        </OlympiadContext.Provider>
    );
};

export const useOlympiad = () => {
    const context = useContext(OlympiadContext);
    if (!context) {
        throw new Error("useOlympiad debe usarse dentro de un OlympiadProvider");
    }
    return context;
};
