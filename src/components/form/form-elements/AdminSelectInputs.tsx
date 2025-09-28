import { useState } from "react";
import MultiSelect from "../MultiSelect";

export default function AdminSelectInputs() {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const multiOptions = [
        { value: "1", text: "Informatica", selected: false },
        { value: "2", text: "Option 2", selected: false },
        { value: "3", text: "Fisica", selected: false },
        { value: "4", text: "Option 4", selected: false },
        { value: "5", text: "Option 5", selected: false },
    ];
    return (
        <div className="space-y-6">
            <div>
                <MultiSelect
                    label="Seleccionar Área(s)"
                    options={multiOptions}
                    defaultSelected={["1", "3"]}
                    onChange={(values) => setSelectedValues(values)}
                />
                <p className="sr-only">
                    Selected Values: {selectedValues.join(", ")}
                </p>
            </div>
        </div>
    );
}
