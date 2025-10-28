import { useEffect, useState } from "react";
import Select from "../../components/form/Select";
import { Olympiad } from "../../types/Olympiad";
import { getOlympiads } from "../../api/services/olympiadService";


export default function AdRegistration() {
  const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
  const [selectedOlympiad, setSelectedOlympiad] = useState <Olympiad>();

  const fetchOlympiads = async () => {
      try {
        const data = await getOlympiads();
        setOlympiads(data);
      } catch (error) {
        console.log(error);
      } 
  };
 
  useEffect(() => {
    fetchOlympiads();
  },[])
  

  return (
    <>
    <div>
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full  space-y-8">
          {/* Selector de Olimpiada */}
          <p className="block text-left text-lg font-semibold mb-3">
                Seleccionar Olimpiada
          </p>
          <p className= "text-gray-600 text-sm mb-3">Elige la olimpiada a la cual deseas registrar los competidores</p>
            <div className=" max-w-md space-y-2">
              
              <Select
                options={olympiads.map((ol) => ({
                  value: ol.id.toString(),
                  label: `${ol.name}`,
                }))}
                 value={selectedOlympiad?.id.toString() || ""} 
                onChange={(val) => {
                  const pkg = olympiads.find((p) => p.id.toString() === val);
                  if (pkg){
                    setSelectedOlympiad(pkg);
                    console.log("ID seleccionado:", pkg.id);
                  } 
                }}
                placeholder="Selecciona una Olimpiada"
              />
            </div>

            {/* Mostrar tabla SOLO si se selecciona una olimpiada */}
            {selectedOlympiad && (
              <div className="mx-auto w-full text-center space-y-6"></div>
            )}
        </div>
      </div>
    </div>
    </>
  );
}
