import type { AuthResponse, LoginPayload, RegisterPayload, User } from "@/services/types";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const loginApi = async (payload: LoginPayload, isAdmin: boolean): Promise<AuthResponse> => {
  const url = isAdmin
    ? `${BASE_URL}/auth/admins/login`
    : `${BASE_URL}/auth/students/login`;
  const response = await fetch(`${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  const res: AuthResponse = await response.json();

  if (!response.ok) {
    return { ...res, error: res.error || "Login failed" };
  }

  return { ...res, success: res.success || "Login successful" };
};

export const registerApi = async (payload: RegisterPayload): Promise<AuthResponse> => {
  console.log(payload);

  const response = await fetch(`${BASE_URL}/auth/students/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }

  const res: AuthResponse = await response.json();

  if (!response.ok) {
    return { ...res, error: res.error || "Registration failed" };
  }

  return { ...res, success: res.success || "Registration successful" };
};
