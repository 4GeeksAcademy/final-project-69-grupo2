
import { Navigate, Outlet } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ProtectedRoute = () => {
    const { store } = useGlobalReducer();

    // Si no está autenticado, lo manda al login
    if (!store.auth.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado, renderiza el contenido de la ruta
    return <Outlet />;
};
