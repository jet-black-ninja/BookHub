import type { Category } from "@/schemas/library";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export type UpdateCategoryPayload = CreateCategoryPayload;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${BASE_URL}/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch categories");
  }

  const res: ApiResponse<Category[]> = await response.json();
  console.log('API Response:', res); // Debug log
  return res.data || [];
};

// Get category by ID
export const getCategoryById = async (id: string): Promise<Category> => {
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch category");
  }

  const res: ApiResponse<Category> = await response.json();
  return res.data;
};

// Create a new category
export const createCategory = async (payload: CreateCategoryPayload): Promise<Category> => {
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create category");
  }

  const res: ApiResponse<Category> = await response.json();
  return res.data;
};

// Update a category
export const updateCategory = async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update category");
  }

  const res: ApiResponse<Category> = await response.json();
  return res.data;
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete category");
  }
};