import { JSX } from "react";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: JSX.Element;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("ohsansi_token");

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};
