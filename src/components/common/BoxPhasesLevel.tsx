
import Alert from "../ui/alert/Alert";

interface Props {
    title?: string;
    message?: string;
}

// Componente que muestra un panel indicando que la fase aún no ha iniciado.
// Problema original: la función tenía cuerpo con llaves pero nunca retornaba JSX, causando que React no renderice nada.
// Además se usa el nombre BoxFaseLevel mientras el archivo se llama BoxPhasesLevel.tsx; el export mantiene la API esperada.
export const BoxFaseLevel = ({ title, message }: Props) => {
    return (
            <Alert
                    variant="error"
                    title={title ?? "Fase no iniciada"}
                    message={message ?? "Esta fase aún no ha comenzado. Espera a que se habilite para este nivel."}
            />
    );
};

