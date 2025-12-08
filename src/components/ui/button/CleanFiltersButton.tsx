import { Clean } from "../../../icons";

interface Props {
  onClick: () => void;
}

export default function ClearFiltersButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-200 mt-2 hover:bg-gray-300 text-gray-700 text-sm font-medium px-3 py-2 mb-2 rounded-lg transition flex items-center gap-2"
    >
      <Clean className="w-5 h-5" />
    </button>
  );
}