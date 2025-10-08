import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import prisma from '../config/database';
import { UserRole } from '../generated/prisma/enums';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export interface AuthenticatedRequest extends Request {
	userId?: string;
	role?: UserRole;
}

export const authenticateJWT = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const authHeader = req.headers['authorization'];
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		res.status(401).json({
			message: 'Authorization header missing or malformed',
		});
		return;
	}

	const token = authHeader.split(' ')[1];
	if (!token) {
		res.status(401).json({ message: 'Token missing' });
		return;
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

		if (!decoded || typeof decoded !== 'object') {
			res.status(401).json({ message: 'Invalid token payload' });
			return;
		}

		const userId = decoded.userId || decoded.id;
		if (!userId) {
			res.status(401).json({ message: 'User ID not found in token' });
			return;
		}

		// Check if user exists in database
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				role: true,
				email: true,
				isVerified: true,
				isDeleted: true,
			},
		});

		if (!user) {
			res.status(401).json({
				message: 'User not found or has been deactivated',
			});
			return;
		}

		// Check if user is deleted
		if (user.isDeleted) {
			res.status(401).json({
				message: 'User account has been deactivated',
			});
			return;
		}

		// Check if user is verified
		if (!user.isVerified) {
			res.status(401).json({
				message:
					'User account is not verified. Please verify your account.',
			});
			return;
		}

		// Attach user data to request
		req.userId = user.id;
		req.role = user.role;

		next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			res.status(401).json({ message: 'Invalid or expired token' });
			return;
		}
		console.error('Authentication error:', error);
		res.status(500).json({
			message: 'Internal server error during authentication',
		});
		return;
	}
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
	return (
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	): void => {
		if (!req.role || !allowedRoles.includes(req.role)) {
			res.status(403).json({
				message: 'Forbidden: insufficient permissions',
			});
			return;
		}
		next();
	};
};
