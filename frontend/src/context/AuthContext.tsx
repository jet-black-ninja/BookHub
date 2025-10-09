import { createContext, useContext, useState, type ReactNode } from "react";
import type { User, LoginPayload, RegisterPayload, AuthResponse } from "@/services/types";
import { loginApi, registerApi } from "@/services/api/auth";

interface AuthContextType {
    user: User | null;
    login: (payload: LoginPayload, isAdmin: boolean) => Promise<AuthResponse>;
    register: (payload: RegisterPayload) => Promise<AuthResponse>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

    const login = async (payload: LoginPayload, isAdmin: boolean): Promise<AuthResponse> => {
        try {
            const res = await loginApi(payload, isAdmin);
            if (res.data) {
                setUser(res.data.user);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                localStorage.setItem("token", res.data.token);
            }
            return res;
        } catch (error) {
            console.log(error);
            return {
                data: { user: {} as User, token: "" },
                error: error instanceof Error ? error.message : "Login failed. Please try again."
            };
        }
    };

    const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
        try {
            const newUser = await registerApi(payload);
            if (newUser.data) {
                setUser(newUser.data.user);
                localStorage.setItem("user", JSON.stringify(newUser.data.user));
                localStorage.setItem("token", newUser.data.token);
            }
            localStorage.setItem("user", JSON.stringify(newUser));
            return newUser;
        } catch (error) {
            return {
                data: { user: {} as User, token: "" },
                error: error instanceof Error ? error.message : "Login failed. Please try again."
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
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