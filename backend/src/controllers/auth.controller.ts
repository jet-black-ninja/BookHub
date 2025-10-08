import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { UserRole } from '../generated/prisma/enums';
import { sendResponse } from '../utils/response';
import { ApiError, sendError } from '../utils/error';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

interface RegisterRequest {
	email: string;
	password: string;
	fullName: string;
	universityId: string;
}

interface LoginRequest {
	email: string;
	password: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - fullName
 *         - universityId
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *         fullName:
 *           type: string
 *         universityId:
 *           type: string
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 fullName:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [ADMIN, STUDENT]
 *                 universityId:
 *                   type: string
 *                 isVerified:
 *                   type: boolean
 *             token:
 *               type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

const generateToken = (userId: string, role: UserRole): string => {
	return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

const validateRegisterInput = (data: RegisterRequest): string | null => {
	if (!data.email || !data.password || !data.fullName || !data.universityId) {
		return 'All fields are required';
	}
	if (data.password.length < 6) {
		return 'Password must be at least 6 characters long';
	}
	if (!data.email.includes('@')) {
		return 'Please provide a valid email address';
	}
	return null;
};

/**
 * @swagger
 * /api/v1/auth/students/register:
 *   post:
 *     summary: Register a new student
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Student registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
export const studentRegister = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { email, password, fullName, universityId }: RegisterRequest =
			req.body;

		// Validate input
		const validationError = validateRegisterInput(req.body);
		if (validationError) {
			sendError(res, new ApiError(validationError, 400));
			return;
		}

		// Check if user already exists
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ email }, { universityId }],
			},
		});

		if (existingUser) {
			sendError(
				res,
				new ApiError(
					'User with this email or university ID already exists',
					409
				)
			);
			return;
		}

		// Hash password
		const saltRounds = 12;
		const passwordHash = await bcrypt.hash(password, saltRounds);

		// Create user
		const user = await prisma.user.create({
			data: {
				email,
				passwordHash,
				fullName,
				universityId,
				role: UserRole.STUDENT,
			},
			select: {
				id: true,
				email: true,
				fullName: true,
				role: true,
				universityId: true,
				isVerified: true,
				createdAt: true,
			},
		});

		// Generate token
		const token = generateToken(user.id, user.role);

		sendResponse(
			res,
			{
				success: true,
				message: 'Student registered successfully',
				data: { user, token },
			},
			201
		);
	} catch (error) {
		console.error('Student registration error:', error);
		sendError(res, new ApiError('Internal server error', 500));
	}
};

/**
 * @swagger
 * /api/v1/auth/admins/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
export const adminRegister = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { email, password, fullName, universityId }: RegisterRequest =
			req.body;

		// Validate input
		const validationError = validateRegisterInput(req.body);
		if (validationError) {
			sendError(res, new ApiError(validationError, 400));
			return;
		}

		// Check if user already exists
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ email }, { universityId }],
			},
		});

		if (existingUser) {
			sendError(
				res,
				new ApiError(
					'User with this email or university ID already exists',
					409
				)
			);
			return;
		}

		// Hash password
		const saltRounds = 12;
		const passwordHash = await bcrypt.hash(password, saltRounds);

		// Create admin user (auto-verified)
		const user = await prisma.user.create({
			data: {
				email,
				passwordHash,
				fullName,
				universityId,
				role: UserRole.ADMIN,
				isVerified: true, // Admins are auto-verified
			},
			select: {
				id: true,
				email: true,
				fullName: true,
				role: true,
				universityId: true,
				isVerified: true,
				createdAt: true,
			},
		});

		// Generate token
		const token = generateToken(user.id, user.role);

		sendResponse(
			res,
			{
				success: true,
				message: 'Admin registered successfully',
				data: { user, token },
			},
			201
		);
	} catch (error) {
		console.error('Admin registration error:', error);
		sendError(res, new ApiError('Internal server error', 500));
	}
};

/**
 * @swagger
 * /api/v1/auth/students/login:
 *   post:
 *     summary: Student login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials or unverified account
 */
export const studentLogin = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { email, password }: LoginRequest = req.body;

		if (!email || !password) {
			sendError(
				res,
				new ApiError('Email and password are required', 400)
			);
			return;
		}

		// Find user
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				passwordHash: true,
				fullName: true,
				role: true,
				universityId: true,
				isVerified: true,
				isDeleted: true,
			},
		});

		if (!user || user.role !== UserRole.STUDENT) {
			sendError(res, new ApiError('Invalid credentials', 401));
			return;
		}

		if (user.isDeleted) {
			sendError(res, new ApiError('Account has been deactivated', 401));
			return;
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(
			password,
			user.passwordHash
		);
		if (!isPasswordValid) {
			sendError(res, new ApiError('Invalid credentials', 401));
			return;
		}

		if (!user.isVerified) {
			sendError(
				res,
				new ApiError(
					'Account is not verified. Please contact admin.',
					401
				)
			);
			return;
		}

		// Generate token
		const token = generateToken(user.id, user.role);

		// Remove password hash from response
		const { passwordHash, ...userWithoutPassword } = user;

		sendResponse(res, {
			success: true,
			message: 'Login successful',
			data: { user: userWithoutPassword, token },
		});
	} catch (error) {
		console.error('Student login error:', error);
		sendError(res, new ApiError('Internal server error', 500));
	}
};

/**
 * @swagger
 * /api/v1/auth/admins/login:
 *   post:
 *     summary: Admin login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
export const adminLogin = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { email, password }: LoginRequest = req.body;

		if (!email || !password) {
			sendError(
				res,
				new ApiError('Email and password are required', 400)
			);
			return;
		}

		// Find admin user
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				passwordHash: true,
				fullName: true,
				role: true,
				universityId: true,
				isVerified: true,
				isDeleted: true,
			},
		});

		if (!user || user.role !== UserRole.ADMIN) {
			sendError(res, new ApiError('Invalid credentials', 401));
			return;
		}

		if (user.isDeleted) {
			sendError(res, new ApiError('Account has been deactivated', 401));
			return;
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(
			password,
			user.passwordHash
		);
		if (!isPasswordValid) {
			sendError(res, new ApiError('Invalid credentials', 401));
			return;
		}

		// Generate token
		const token = generateToken(user.id, user.role);

		// Remove password hash from response
		const { passwordHash, ...userWithoutPassword } = user;

		sendResponse(res, {
			success: true,
			message: 'Admin login successful',
			data: { user: userWithoutPassword, token },
		});
	} catch (error) {
		console.error('Admin login error:', error);
		sendError(res, new ApiError('Internal server error', 500));
	}
};
