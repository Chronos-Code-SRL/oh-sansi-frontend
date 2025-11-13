import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Oh Sansi - Inicio de Sesión"
        description="Esta es la página de inicio de sesión de Oh Sansi"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
