
export type UserRole = "ADMIN" | "STUDENT";

export interface User {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    universityId: string
    token?: string;
}

export interface AuthResponse {
    success?: string;
    error?: string;
    data: {
        user: User;
        token: string;
    };
}

export interface LoginPayload {
    email: string;
    password: string;
}


export interface RegisterPayload {
    fullName: string;
    email: string;
    password: string;
    universityId: string
}
