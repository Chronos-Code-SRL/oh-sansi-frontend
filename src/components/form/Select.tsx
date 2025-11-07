import { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Seleccione una opción",
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="relative w-full">
      {/* input visual */}
      <div
        onClick={toggleDropdown}
        className="mb-2 flex h-11 w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      >
        <span className={selectedLabel ? "" : "text-gray-400 dark:text-gray-500"}>
          {selectedLabel || placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
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
      </div>

      {/* dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-40 mt-1 w-full rounded-lg bg-white shadow-sm dark:bg-gray-900">
          <div className="flex flex-col">
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`cursor-pointer p-2 hover:bg-primary/5 ${
                  opt.value === value ? "bg-primary/10" : ""
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span className="text-sm text-gray-800 dark:text-white/90">
                  {opt.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
