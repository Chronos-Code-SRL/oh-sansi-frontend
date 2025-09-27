import type React from "react";
import { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  text: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  defaultSelected?: string[];
  onChange?: (selected: string[]) => void;
  disabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  defaultSelected = [],
  onChange,
  disabled = false,
}) => {
  const [selectedOptions, setSelectedOptions] =
    useState<string[]>(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (!disabled) setIsOpen((prev) => !prev);
  };

  const handleSelect = (optionValue: string) => {
    const newSelectedOptions = selectedOptions.includes(optionValue)
      ? selectedOptions.filter((value) => value !== optionValue)
      : [...selectedOptions, optionValue];

    setSelectedOptions(newSelectedOptions);
    onChange?.(newSelectedOptions);
    setIsOpen(false); {/*cerrar al seleccionar*/}
  };

  const removeOption = (value: string) => {
    const newSelectedOptions = selectedOptions.filter((opt) => opt !== value);
    setSelectedOptions(newSelectedOptions);
    onChange?.(newSelectedOptions);
  };

  {/*Cerrar al hacer clic fuera*/}
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedValuesText = selectedOptions.map(
    (value) => options.find((option) => option.value === value)?.text || ""
  );

  return (
    <div className="w-full" ref={dropdownRef}>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {label}
      </label>

      <div className="relative z-20 inline-block w-full">
        <div className="mb-2 flex h-11 rounded-lg border border-gray-300 py-1.5 pl-3 pr-3 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900">          
          <div className="flex flex-wrap flex-auto gap-2 max-h-20 overflow-y-auto">
            {selectedValuesText.length > 0 ? (
              selectedValuesText.map((text, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-center rounded-full border-[0.7px] border-transparent bg-gray-100 py-1 pl-2.5 pr-2 text-sm text-gray-800 hover:border-gray-200 dark:bg-gray-800 dark:text-white/90 dark:hover:border-gray-800"
                >
                  <span className="flex-initial max-w-full">{text}</span>
                  <div className="flex flex-row-reverse flex-auto">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOption(selectedOptions[index]);
                      }}
                      className="pl-2 text-gray-500 cursor-pointer group-hover:text-gray-400 dark:text-gray-400"
                    >
                      ✕
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500">
                Seleccionar opción
              </span>
            )}
          </div>

          <div className="flex items-center py-1 pl-1 pr-1 w-7">
            <button
              type="button"
              onClick={toggleDropdown}
              className="w-5 h-5 text-gray-700 cursor-pointer dark:text-gray-400"
            >
              <svg
                className={`stroke-current transition-transform ${isOpen ? "rotate-180" : ""}`}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {isOpen && (
          <div
            className="absolute left-0 z-40 w-full overflow-y-auto bg-white rounded-lg shadow-sm top-full max-h-40 dark:bg-gray-900"
          >
            <div className="flex flex-col">
              {options.map((option, index) => (
                <div
                  key={index}
                  className={`hover:bg-primary/5 w-full cursor-pointer border-b border-gray-200 dark:border-gray-800`}
                  onClick={() => handleSelect(option.value)}
                >
                  <div
                    className={`relative flex w-full items-center p-2 ${
                      selectedOptions.includes(option.value)
                        ? "bg-primary/10"
                        : ""
                    }`}
                  >
                    <div className="mx-2 leading-6 text-gray-800 dark:text-white/90">
                      {option.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;
