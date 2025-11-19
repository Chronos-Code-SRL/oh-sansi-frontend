import { useState } from "react";
import { DownloadIcon } from "../../icons";

export default function FloatingDownloadButton({ hasData, onPDF, onCSV, onExcel }) {
  const [open, setOpen] = useState(false);

  if (!hasData) return null; // Solo aparece si hay datos

  return (
    <div className="fixed bottom-6 left-4 md:left-[300px] flex flex-col items-start z-50">

      {/* Botones circulares (solo si open === true) */}
      {open && (
        <div className="flex flex-col space-y-3 mb-3 transition-all">
          <button
            onClick={onPDF}
            className="w-10 h-10 rounded-full bg-red-500 text-white flex justify-center items-center hover:scale-110 transition"
            title="Descargar PDF"
          >
            PDF
          </button>

          <button
            onClick={onCSV}
            className="w-10 h-10 rounded-full bg-blue-500 text-white flex justify-center items-center hover:scale-110 transition"
            title="Descargar CSV"
          >
            CSV
          </button>

          <button
            onClick={onExcel}
            className="w-10 h-10 rounded-full bg-green-500 text-white flex justify-center items-center hover:scale-110 transition"
            title="Descargar Excel"
          >
            XLS
          </button>
        </div>
      )}

      {/* Botón principal */}
      <button
        onClick={() => setOpen(!open)}
        className="
          group flex items-center gap-2 
          bg-[#3756A6] hover:bg-[#2F55B8] text-white rounded-full px-3 py-3 shadow-lg
          hover:px-3 transition-all duration-200
        "
      >
        <DownloadIcon className="h-6 w-6" />
        {/* Este texto aparece solo cuando el mouse pasa encima */}
        <span className="overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-200">
          Descargar
        </span>
      </button>
    </div>
  );
}
