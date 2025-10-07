export interface User {
    id: string;
    name: string;
    email: string;
    role: "admin" | "student";
    token?: string;
}

export interface AuthResponse {
    success?: string;
    error?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}


export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}
