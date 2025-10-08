// Reusable API response utility
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export function sendResponse<T>(res: import('express').Response, {
  success = true,
  message = '',
  data,
  pagination
}: ApiResponse<T>) {
  res.status(success ? 200 : 400).json({
    success,
    message,
    data,
    pagination
  });
}

