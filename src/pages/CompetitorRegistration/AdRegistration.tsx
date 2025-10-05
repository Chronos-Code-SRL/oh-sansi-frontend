import DropzoneComponent from "../../components/form/form-elements/DropZone";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { CheckCircleIcon, DownloadIcon, ErrorIcon, FileIcon, InfoIcon } from "../../icons";
import TitleBreadCrumb from "../../components/common/TitleBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import Select from "../../components/form/Select";
import { Olympiad } from "../../types/Olympiad";
import { getOlympiads } from "../../services/olympiadService";

//import Dropzone from "react-dropzone";

type UploadedFile = {
  name: string;
  size: string;
};

export default function AdRegistration() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
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
  
  const handleFilesAdded = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
    }));

    setFiles((prev) => [...prev, ...newFiles]); 
  };

  return (
    <>
    <div>
      <PageMeta
        title="Registro de Competidores"
        description="Registro masivo de competidores para las Olimpiadas"
      />
      < TitleBreadCrumb pageTitle="Registro de Competidores" />
      
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
                  value: ol.id,
                  label: `${ol.name} - ${ol.edition}`,
                }))}
                value={selectedOlympiad?.id || ""}
                onChange={(val) => {
                  const pkg = olympiads.find((p) => p.id === val);
                  if (pkg) setSelectedOlympiad(pkg);
                }}
                placeholder="Selecciona una Olimpiada"
              />
               </div>

            {/* Mostrar Dropzone SOLO si se selecciona una olimpiada */}
            {selectedOlympiad && (
              <div className="mx-auto w-full text-center space-y-6">


          <DropzoneComponent onFilesAdded={handleFilesAdded} />
            {/* Lista de archivos subidos */}
             
                {files.length > 0 && (
                 <ComponentCard title="Archivos subidos">
                  <div className="mt-6 text-left">
                    <div className="space-y-2">
                      {files.map((f, idx) => (
                         <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 border rounded-xl gap-3"
  >
                         <div className="flex items-start space-x-3">
                            <FileIcon className="w-6 h-6 text-gray-600 mt-1" />
                            <div>
                              <p className="font-medium">{f.name}</p>
                              <p className="text-sm text-gray-500">{f.size}</p>
                              <div className="mt-1 space-x-2">
                                <Badge color="info" startIcon={<InfoIcon className="size-5" />} >72 registros totales</Badge>
                                <Badge color="success" startIcon={<CheckCircleIcon className="size-5" />}>55 exitosos</Badge>
                                <Badge color="error" startIcon={<ErrorIcon className="size-5" />}>17 errores</Badge>
                              </div>
                            </div>
                          </div>
                            <div className="sm:ml-auto ">      
                              <Button size="sm" variant= "outline" startIcon={<DownloadIcon className="size-5" />}> 
                                Descargar CSV de errores
                              </Button>
                            </div>
                            
                          
                        </div>
                      ))}
                    </div>
                  </div>  
                  </ComponentCard>                
                 )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
