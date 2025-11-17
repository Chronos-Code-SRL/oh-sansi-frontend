import { useMemo, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { ChevronDownIcon, TrophyGold, TrophySilver, TrophyBronze, Award } from "../../icons";

export type ClassificationLabel = "Oro" | "Plata" | "Bronce" | "Mención de Honor";

type MedalSelectorProps = {
    value: string | null; // siempre string o null (desde API/UI)
    onChange: (value: ClassificationLabel | null) => void; // devolvemos string o null
    disabled?: boolean;
};

const options: { id: ClassificationLabel; Icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: "Oro", Icon: TrophyGold },
    { id: "Plata", Icon: TrophySilver },
    { id: "Bronce", Icon: TrophyBronze },
    { id: "Mención de Honor", Icon: Award },
];

export default function MedalSelector({ value, onChange, disabled }: MedalSelectorProps) {
    const [open, setOpen] = useState(false);

    const normalized: ClassificationLabel | null = useMemo(() => {
        if (value === "Oro" || value === "Plata" || value === "Bronce" || value === "Mención de Honor") return value;
        return null; // null/undefined/otro -> Sin medalla
    }, [value]);

    const current = useMemo(() => options.find((o) => o.id === normalized) ?? options[3], [normalized]);

    return (
        <div className="relative inline-block text-left w-full sm:w-56">
            <button
                type="button"
                disabled={disabled}
                className={`w-full inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:hover:bg-white/5`}
                onClick={() => setOpen((v) => !v)}
            >

                <current.Icon className={`h-5 w-5 ${normalized === null ? "opacity-40" : ""}`} />
                <span className="flex-1 whitespace-nowrap text-left truncate">{current.id}</span>
                <ChevronDownIcon className={`ml-1 h-4 w-4 ${open ? "rotate-180" : ""}`} />
            </button>

            <Dropdown isOpen={open} onClose={() => setOpen(false)} className="w-full">
                <div className="py-1">
                    {options.map(({ id, Icon }) => (
                        <DropdownItem
                            key={id}
                            onItemClick={() => {
                                onChange(id === null ? null : id);
                                setOpen(false);
                            }}
                            baseClassName={`flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10 ${id === normalized ? "bg-primary/10 text-primary" : "text-gray-700 dark:text-gray-200"
                                }`}
                        >
                            <Icon className={`h-5 w-5 ${id === null ? "opacity-40" : ""}`} />
                            <span>{id}</span>
                        </DropdownItem>
                    ))}
                </div>
            </Dropdown>
        </div>
    );
}
