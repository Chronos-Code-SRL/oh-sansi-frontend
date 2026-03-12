import React, { useState, useRef, useEffect } from "react";
import Checkbox from "../form/input/Checkbox";
import { ChevronDownIcon } from "../../icons";

interface FilterDropdownProps {
  label: string;
  options: { label: string; value: string }[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selectedValues,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left m-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between min-w-[130px] gap-2 rounded-md bg-[#3756A6] px-4 py-2 text-white hover:bg-[#2F55B8] disabled:bg-gray-300 transition"
      >
        {label}
        <ChevronDownIcon
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-40 rounded-md bg-white shadow-lg ring-1 ring-gray-200 z-10">
          <div className="py-2 mx-2 max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {options.map((opt) => (
              <Checkbox
                checked={selectedValues.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
                label={opt.label}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
