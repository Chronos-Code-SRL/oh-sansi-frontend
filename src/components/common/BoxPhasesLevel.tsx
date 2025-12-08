
import Alert from "../ui/alert/Alert";

interface Props {
    title?: string;
    message?: string;
}

export const BoxFaseLevel = ({ title, message }: Props) => {
    return (
        <Alert
            variant="error"
            title={title ?? "Fase no iniciada"}
            message={message ?? "Esta fase aún no ha comenzado. Espera a que se habilite para este nivel."}
        />
    );
};

