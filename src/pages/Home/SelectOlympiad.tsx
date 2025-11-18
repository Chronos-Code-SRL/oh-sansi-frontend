import LadingPage from "../../components/home/LadingPageOlympiad"
import { Navigate } from "react-router";
import {getRoleName, getUser } from "../../api/services/authService";

export const SelectOlympiad = () => {

  const user = getUser();
  const roleName = getRoleName(user);

  // Si es Admin (por nombre de rol), redirige al dashboard con sidebar y evita renderizar esta página
  if (roleName === "Admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <>
    <LadingPage />
    </>
  )
}
