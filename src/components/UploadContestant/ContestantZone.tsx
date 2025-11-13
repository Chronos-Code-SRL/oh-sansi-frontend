import DropzoneComponent from "./DropZone";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Button from "../ui/button/Button";
import { CheckCircleIcon, DownloadIcon, ErrorIcon, FileIcon, InfoIcon } from "../../icons";
import Badge from "../ui/badge/Badge";
import Select from "../form/Select";
import { Olympiad } from "../../types/Olympiad";
import { getOlympiads } from "../../api/services/olympiadService";
import { uploadCompetitorCsv, downloadErrorCsv, getCsvUploadsByOlympiad } from "../../api/services/uploadContestantService"
import { FileDetail, UploadCsv } from "../../types/CompetitorUpload";
import BadgeInformation from "./InformationZone";
import InformationZone from "./InformationZone";

type FileWithDetails = UploadCsv & { details: FileDetail[] };

export default function AdRegistration() {
  const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
  const [selectedOlympiad, setSelectedOlympiad] = useState<Olympiad>();
  const [files, setFiles] = useState<FileWithDetails[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingUploads, setIsLoadingUploads] = useState(false);

  const fetchOlympiads = async () => {
    try {
      const data = await getOlympiads();
      setOlympiads(data);
    } catch (error) {
      console.log(error);
    }
  }

  // Obtener uploads de la olimpiada seleccionada
  const fetchUploads = async (olympiadId: number) => {
    setIsLoadingUploads(true);
    try {
      const res = await getCsvUploadsByOlympiad(olympiadId);

      // Unificar estructura de detalles
      const filesWithDetails: FileWithDetails[] = res.data.csv_uploads.map(f => ({
        ...f,
        details: [
          {
            id: f.id,
            filename: f.original_file_name,
            successful: f.successful_records,
            competitor_errors: f.failed_records,
            header_errors: f.header_errors,
            total_records: f.total_records,
            error_file: f.has_error_file ? f.original_file_name.replace(".csv", "-errores.csv") : undefined,
            uploaded_at_human: f.uploaded_at_human,
            file_size: f.file_size,
          }
        ]
      }));

      setFiles(filesWithDetails);
    } catch (err) {
      console.error("Error al obtener cargas CSV:", err);
    } finally {
      setIsLoadingUploads(false);
    }
  };


  useEffect(() => {
    fetchOlympiads();
  }, []);

  useEffect(() => {
    if (selectedOlympiad) {
      fetchUploads(selectedOlympiad.id);
    } else {
      setFiles([]);
    }
  }, [selectedOlympiad]);

  const handleFilesAdded = async (acceptedFiles: File[]) => {
    if (!selectedOlympiad) return alert("Selecciona una olimpiada primero");
    setIsUploading(true);
    try {
      const res = await uploadCompetitorCsv(acceptedFiles, selectedOlympiad.id);

      //  mapear detalles de la respuesta POST
      const uploadedFiles: FileWithDetails[] = res.data.details.map(d => ({
        id: d.id,
        original_file_name: d.filename,
        successful_records: d.successful,
        failed_records: d.competitor_errors,
        total_records: d.total_records,
        success_rate: d.total_records > 0 ? Math.round((d.successful / d.total_records) * 100) : 0,
        has_errors: d.competitor_errors > 0 || d.header_errors > 0,
        has_error_file: !!d.error_file,
        header_errors: d.header_errors,
        uploaded_at_human: d.uploaded_at_human,
        file_size: d.file_size,
        details: [d]
      }));

      setFiles(prev => [
        ...uploadedFiles,
        ...prev
      ]);

    } catch (error) {
      console.error("Error al subir archivos CSV:", error);
    } finally {
      setIsUploading(false);
    }
  };
  // Descargar CSV de errores
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
        <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
          <div className="mx-auto w-full  space-y-8">
            {/* Selector de Olimpiada */}
            <p className="block text-left text-lg font-semibold mb-3">
              Seleccionar Olimpiada
            </p>
            <p className="text-gray-600 text-sm mb-3">Elige la olimpiada a la cual deseas registrar los competidores</p>
            <div className=" max-w-md space-y-2">

              <Select
                options={olympiads.map((ol) => ({
                  value: ol.id.toString(),
                  label: `${ol.name}`,
                }))}
                value={selectedOlympiad?.id.toString() || ""}
                onChange={(val) => {
                  const ol = olympiads.find((o) => o.id.toString() === val);
                  if (ol) {
                    setSelectedOlympiad(ol);
                    console.log("ID seleccionado:", ol.id);
                  }
                }}
                placeholder="Selecciona una Olimpiada"
              />
            </div>
            <InformationZone />
            {/* Mostrar Dropzone SOLO si se selecciona una olimpiada */}
            {selectedOlympiad && (
              <div className="mx-auto w-full text-center space-y-6">

                <DropzoneComponent onFilesAdded={handleFilesAdded} />
                {/* Lista de archivos subidos */}
                <ComponentCard title="Archivos subidos">

                  {isLoadingUploads ? (
                    <p className="text-gray-500">Cargando archivos...</p>
                  ) : files.length === 0 ? (
                    <p className="text-gray-500">No se han subido archivos aún.</p>
                  ) : (

                    <div className="mt-6 text-left">
                      <div className="space-y-2">
                        {files.map((f) => (
                          <div
                            key={f.id}
                            className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 border rounded-xl gap-3"
                          >
                            <div className="flex items-start space-x-3">
                              <FileIcon className="w-6 h-6 text-gray-600 mt-1" />
                              <div>
                                <p className="font-medium mb-1">{f.original_file_name}</p>
                                <p className="text-sm text-gray-500 mb-2">{f.file_size} MB</p>


                                {f.details[0].header_errors > 0 ? (
                                  <Badge color="error" startIcon={<ErrorIcon className="size-5" />}>
                                    Archivo inválido: revisa que el CSV tenga cabecera correcta.
                                  </Badge>
                                ) : f.details[0].total_records === 0 ? (
                                  <Badge color="error" startIcon={<ErrorIcon className="size-5" />}>
                                    El archivo está vacío. Asegúrate de que contenga registros.
                                  </Badge>
                                ) : (
                                  <div className="mt-1 space-x-2">
                                    <Badge color="info" startIcon={<InfoIcon className="size-5" />}>
                                      {f.details[0].total_records} registros totales
                                    </Badge>
                                    <Badge color="success" startIcon={<CheckCircleIcon className="size-5" />}>
                                      {f.details[0].successful} exitosos  ({f.success_rate})%
                                    </Badge>
                                    <Badge color="error" startIcon={<ErrorIcon className="size-5" />}>
                                      {f.details[0].competitor_errors} errores
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>


                            <div className="flex flex-col items-end justify-between relative">
                              <p className="text-sm text-gray-500 mt-1 mr-2 mb-4">
                                {f.uploaded_at_human}
                              </p>
                              {f.details[0].error_file && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  startIcon={<DownloadIcon className="size-5" />}
                                  onClick={() => handleDownloadError(f.details[0].error_file!)}
                                >
                                  Descargar CSV de errores
                                </Button>
                              )}
                              
                            </div>


                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </ComponentCard>

              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
