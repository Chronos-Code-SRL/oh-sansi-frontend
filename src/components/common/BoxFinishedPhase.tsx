import Alert from "../ui/alert/Alert";

export default function BoxFinishedPhase() {
    return (
        <>
            <Alert
                variant="info"
                title="FASE FINALIZADA"
                message="Esta fase ha sido finalizada y ya no se permiten más modificaciones."
                showLink={false}
            />
        </>
    );
}