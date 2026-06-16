import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRole?: "admin" | "atleta";
}

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export default function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const decoded = parseJwt(token);
  
  if (!decoded) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  if (allowedRole) {
    const userRole = decoded.role === "admin" || decoded.is_admin === 1 ? "admin" : "atleta";

    if (userRole !== allowedRole) {
      return userRole === "admin" 
        ? <Navigate to="/menu-adm" replace /> 
        : <Navigate to="/menu-atleta" replace />;
    }
  }

  return <Outlet />;
}