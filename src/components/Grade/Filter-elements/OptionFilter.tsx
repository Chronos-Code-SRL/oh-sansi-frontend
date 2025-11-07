import Checkbox from "../../form/input/Checkbox";

interface OptionsPanelProps {
  options: string[];
  selected: string[];
  toggle: (value: string) => void;
}

export function OptionsPanel({ options, selected, toggle }: OptionsPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={selected.includes(opt)} onChange={() => toggle(opt)} />
          <span className="text-sm text-gray-700">{opt}</span>
        </label>
      ))}
    </div>
  );
}
