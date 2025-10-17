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
import { getOlympiads } from "../../api/services/olympiadService";
import { uploadCompetitorCsv , downloadErrorCsv } from "../../api/services/competitorService"
import { FileDetail } from "../../types/CompetitorUpload";

type UploadedFile = {
  name: string;
  size: string;
  file: File;
  result?: FileDetail;
};

export default function AdRegistration() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
  const [selectedOlympiad, setSelectedOlympiad] = useState <Olympiad>();
  const [isUploading, setIsUploading] = useState(false);

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
  
  const handleFilesAdded = async (acceptedFiles: File[]) => {
    if (!selectedOlympiad) return alert("Selecciona una olimpiada primero");

    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
      if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + " MB";
      return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";
    };

    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      name: file.name,
      size: formatFileSize(file.size),
      file,
    }));

    setFiles((prev) => [...newFiles, ...prev]); 

    try {
      setIsUploading(true);
      const res = await uploadCompetitorCsv(
        acceptedFiles,
        selectedOlympiad.id
      );

      // Asignamos resultados solo a los nuevos archivos que subimos
      const filesWithResults = newFiles.map((f) => {
        const match = res.data.details.find(d => d.filename === f.name);
        return match ? { ...f, result: match } : f;
      });

      setFiles(prev => [
      ...filesWithResults,
      ...prev.filter(f => !acceptedFiles.some(a => a.name === f.name))
    ]);
    } catch (error) {
      console.error("Error al subir archivos CSV:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadError = async (filename: string) => {
  try {
    const blob = await downloadErrorCsv(filename);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al descargar archivo CSV de errores:", error);
  }
};

  return (
    <>
    <div>
      <PageMeta
        title="Registro de Competidores"
        description="Registro masivo de competidores para las Olimpiadas"
      />
      < TitleBreadCrumb pageTitle="Registrar Competidores" />
      
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
                                  <p className="font-medium mb-1">{f.name}</p>
                                  <p className="text-sm text-gray-500 mb-2">{f.size}</p>

                                  {f.result?.header_errors && f.result.header_errors > 0 ? (
                                    <Badge color="error" startIcon={<ErrorIcon className="size-5" />}>
                                      Archivo inválido: revisa que el CSV tenga cabecera correcta.
                                    </Badge>
                                  ): f.result?.total_records === 0 ? (
                                    <Badge color="error" startIcon={<ErrorIcon className="size-5" />}>
                                      El archivo está vacío. Asegúrate de que contenga registros.
                                    </Badge>
                                  ) : f.result ? (
                                    <div className="mt-1 space-x-2">
                                      <Badge color="info" startIcon={<InfoIcon className="size-5" />} >{f.result.total_records} registros totales</Badge>
                                      <Badge color="success" startIcon={<CheckCircleIcon className="size-5" />}>{f.result.successful} exitosos</Badge>
                                      <Badge color="error" startIcon={<ErrorIcon className="size-5" />}>{f.result.competitor_errors} errores</Badge>
                                    </div>
                                  ):(
                                    <p className="text-gray-400 text-sm mt-1">Cargando registros...</p>
                                  )}
                                </div>
                              </div>

                                  {f.result?.error_file && f.result.successful < f.result.total_records &&(
                                    <div className="sm:ml-auto">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        startIcon={<DownloadIcon className="size-5" />}
                                        onClick={() => handleDownloadError(f.result!.error_file!)}
                                      >
                                        Descargar CSV de errores
                                      </Button>
                                    </div>
                                  )}
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
