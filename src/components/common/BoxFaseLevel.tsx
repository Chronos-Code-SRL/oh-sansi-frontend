import { InfoIcon, LockIcon } from "../../icons"
import Alert from "../ui/alert/Alert"

interface props{
    title?: string;
    message?: string;
}

export const BoxFaseLevel = ({title, message}: props) => {
  return (
    <>
               {/* Panel de estado de la fase (similar a la imagen) */}
                {/* {selectedLevelId !== null && !loading && students.length === 0 && ( */}
                    <div className="bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow mb-6">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-gray-600"><LockIcon className="size-5" /></div>
                                <h3 className="text-lg text-center font-semibold text-gray-900"> no iniciada</h3>
                        </div>
    
                        <div className="gap-6 mt-6">
                                {/* <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm leading-relaxed">
                                    <p className="font-semibold text-gray-900">
                                        Fase 1 - Astronomía: <span className="font-normal text-blue-700">En evaluación</span>
                                    </p>
                                    <p className="mt-1 text-xs text-gray-600">Espera a que se complete la evaluación de la fase anterior</p>
                                </div> */}
                                <Alert variant="info" title="Fase no iniciada" message="Espera a que se complete la fase de evaluación"/>
                            
                        </div>
                    </div>
    </>
  )
}
