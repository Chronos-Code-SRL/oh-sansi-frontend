import DropzoneComponent from "../../components/form/form-elements/DropZone";
import PageMeta from "../../components/common/PageMeta";
import { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
//import Dropzone from "react-dropzone";

type UploadedFile = {
  name: string;
  size: string;
};
import AdminPageBreadCrumb from "../../components/common/AdminPageBreadCrumb";

export default function AdRegistration() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFilesAdded = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
      status: "Completado" as const,
    }));

    setFiles((prev) => [...prev, ...newFiles]); // acumulamos
  };

  return (
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
                {files.length > 0 && (
                  <ComponentCard title="Archivos subidos">
                  <div className="mt-6 text-left">
                    <div className="space-y-2">
                      {files.map((f, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 border rounded-xl shadow-sm "
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
                   </ComponentCard>
                )
               
                }
             
          
           

        </div>
      </div>
    </div>
  );
}
