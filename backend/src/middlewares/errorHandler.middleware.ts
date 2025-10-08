import { ApiError, sendError } from '../utils/error';
import { NextFunction, Request, Response } from 'express';

export function errorHandler(
	err: ApiError,
	_req: Request,
	res: Response,
	_next: NextFunction
) {
	if (err instanceof ApiError) {
		sendError(res, err);
	} else {
		sendError(res, new ApiError('Internal Server Error', 500));
	}
}
