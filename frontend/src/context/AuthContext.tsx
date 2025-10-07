import { createContext, useContext, useState, type ReactNode } from "react";
import type { User, LoginPayload, RegisterPayload, AuthResponse } from "@/services/types";
import { loginApi, registerApi } from "@/services/api/auth";

interface AuthContextType {
    user: User | null;
    login: (payload: LoginPayload) => Promise<AuthResponse>;
    register: (payload: RegisterPayload) => Promise<AuthResponse>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

    const login = async (payload: LoginPayload) => {
        try {
            const loggedInUser = await loginApi(payload);
            setUser(loggedInUser);
            localStorage.setItem("user", JSON.stringify(loggedInUser));
            return { success: "Login successful" };
        } catch (error) {
            console.log(error);
            return {
                error: error instanceof Error ? error.message : "Login failed. Please try again."
            };
        }
    };

    const register = async (payload: RegisterPayload) => {
        try {
            const newUser = await registerApi(payload);
            setUser(newUser);
            localStorage.setItem("user", JSON.stringify(newUser));
            return { success: "Registration successful" };
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : "Login failed. Please try again."
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};