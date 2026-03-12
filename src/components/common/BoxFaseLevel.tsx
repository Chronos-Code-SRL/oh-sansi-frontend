import { LockIcon } from "../../icons"
import Alert from "../ui/alert/Alert"

interface props {
    title: string;
    message: string;
}

export const BoxFaseLevel = ({ title, message }: props) => {
    return (
        <>

            <div className="bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow mb-6">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-gray-600"><LockIcon className="size-5" /></div>
                    <h3 className="text-lg text-center font-semibold text-gray-900"> no iniciada</h3>
                </div>

                <div className="gap-6 mt-6">
                    <Alert variant="info" title={title} message={message} />

                </div>
            </div>
        </>
    )
}
