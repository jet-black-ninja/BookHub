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

export function sendResponse<T>(
	res: import('express').Response,
	{ success = true, message = '', data, pagination }: ApiResponse<T>,
	statusCode?: number
) {
	const status = statusCode || (success ? 200 : 400);
	res.status(status).json({
		success,
		message,
		data,
		pagination,
	});
}

// Success response helper
export function sendSuccessResponse<T>(
	res: import('express').Response,
	data?: T,
	message: string = 'Success',
	statusCode: number = 200
) {
	res.status(statusCode).json({
		success: true,
		message,
		data,
	});
}

// Error response helper
export function sendErrorResponse(
	res: import('express').Response,
	message: string = 'An error occurred',
	statusCode: number = 400,
	data?: any
) {
	res.status(statusCode).json({
		success: false,
		message,
		...(data && { data }),
	});
}
