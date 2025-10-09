import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";


export default function PublicRoute({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    if (user) {
        return user.role === "ADMIN"
            ? <Navigate to="/admin/dashboard" replace />
            : <Navigate to="/dashboard" replace />;
    }

    return children;
}