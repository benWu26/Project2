import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/UserContext";
import { JSX } from "react";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useUser();

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
