import LadingPage from "../../components/home/LadingPageOlympiad"
import { Navigate } from "react-router";
import {getRoleName, getUser } from "../../api/services/authService";

export const SelectOlympiad = () => {

  const user = getUser();
  const roleNames = getRoleName(user);
  const isAdmin = roleNames[0] === "Admin";
  // Si es Admin (por nombre de rol), redirige al dashboard con sidebar y evita renderizar esta página
  if (isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
    <LadingPage />
    </>
  )
}
