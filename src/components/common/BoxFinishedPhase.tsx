import Alert from "../ui/alert/Alert";

export default function BoxFinishedPhase() {
    return (
        <>
            <Alert
                variant="success"
                title="FASE TERMINADA"
                message="Esta fase ha sido terminada y ya no se permiten más modificaciones."
                showLink={false}
            />
        </>
    );
}