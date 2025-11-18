import Alert from "../ui/alert/Alert";

export default function BoxFinishedPhase() {
    return (
        <>
            <Alert
                variant="success"
                title="FASE FINALIZADA"
                message="Esta fase ha sido finalizada y ya no se permiten más modificaciones."
                showLink={false}
            />
        </>
    );
}