import { ApiError, sendError } from '../utils/error';
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ApiError) {
    sendError(res, err);
  } else {
    sendError(res, new ApiError('Internal Server Error', 500));
  }
}
