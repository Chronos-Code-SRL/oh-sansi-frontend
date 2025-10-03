import DropzoneComponent from "../../components/form/form-elements/DropZone";
import PageMeta from "../../components/common/PageMeta";
import { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import AdminPageBreadCrumb from "../../components/common/AdminPageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Alert from "../../components/ui/alert/Alert";
import { DownloadIcon } from "../../icons";
//import Dropzone from "react-dropzone";

type UploadedFile = {
  name: string;
  size: string;
};
export default function AdRegistration() {
  const { isOpen, openModal, closeModal } = useModal();
  const [files, setFiles] = useState<UploadedFile[]>([]);

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
        title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AdminPageBreadCrumb pageTitle="Registro de Competidores" />
      
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full text-center space-y-6">
          <DropzoneComponent onFilesAdded={handleFilesAdded} />
            {/* Lista de archivos subidos */}
             <ComponentCard title="Archivos subidos">
                {files.length > 0 && (
                 
                  <div className="mt-6 text-left">
                    <div className="space-y-2">
                      {files.map((f, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 border rounded-xl"
                        >
                          <div>
                            <p className="font-medium">{f.name}</p>
                            <p className="text-sm text-gray-500">{f.size}</p>
                          </div>
                          <span className="text-green-600 font-semibold"></span>
                        </div>
                      ))}
                    </div>
                  </div>                  
                )
                }
                <div className="flex items-center gap-3 px-2 mt-6 justify-end">
                  <Button size="sm" onClick={(openModal)}>
                    Inscribir
                  </Button>
                </div>
              </ComponentCard>
              <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                  {/* Header */}
                  <div className="px-2 pr-14 text-left mb-8">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                      Resultado del Procesamiento
                    </h4>
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400 lg:mb-4">
                      Archivo: Copia de VelocidadDeConsultas.csv
                    </p>
                  </div>

                  {/* Cifras principales */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="rounded-xl border p-4 text-center bg-gray-50 dark:bg-gray-800">
                      <p className="text-sm text-gray-500">Total Registros</p>
                      <p className="text-2xl font-bold">148</p>
                    </div>
                    <div className="rounded-xl border p-4 text-center bg-green-50 border-green-200 dark:bg-green-900/20">
                      <p className="text-sm text-gray-500">Exitosos</p>
                      <p className="text-2xl font-bold text-green-600">140</p>
                    </div>
                    <div className="rounded-xl border p-4 text-center bg-red-50 border-red-200 dark:bg-red-900/20">
                      <p className="text-sm text-gray-500">Con Errores</p>
                      <p className="text-2xl font-bold text-red-600">8</p>
                    </div>
                  </div>

                  {/* Advertencia */}
                  <div className="mb-6 text-left">
                    <Alert
                      variant="warning"
                      title="Procesado con Advertencias"
                      message="Se procesaron 140 registros correctamente, pero 8 registros tienen errores que deben ser corregidos."
                      showLink={false}
                    />
                  </div>

                  {/* Detalle de errores */}
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-lg font-semibold">Detalle de Errores</h5>
                    <Button size="sm" variant= "outline" startIcon={<DownloadIcon className="size-5" />} onClick={closeModal} > 
                      Descargar CSV de errores
                    </Button>
                  </div>
                  
                  {/* Botón inferior */}
                  <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                    <Button onClick={closeModal}>
                      Cerrar
                    </Button>
                     
                  </div>
                </div>
              </Modal>

        </div>
      </div>
    </div>
    </>
  );
}
