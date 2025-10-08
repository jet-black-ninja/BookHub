// Reusable error response utility
export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function sendError(res: import('express').Response, error: ApiError) {
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message
  });
}

