import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the category
 *         name:
 *           type: string
 *           description: The category name (unique)
 *         description:
 *           type: string
 *           description: The category description
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Category creation date
 *
 *     CreateCategoryRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description:
 *           type: string
 *           maxLength: 500
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories (Admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
export const getAllCategories = async (
	_req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const categories = await prisma.category.findMany({
			include: {
				_count: {
					select: {
						books: {
							where: {
								isDeleted: false,
							},
						},
					},
				},
			},
			orderBy: {
				name: 'asc',
			},
		});

		sendSuccessResponse(
			res,
			categories,
			'Categories retrieved successfully'
		);
	} catch (error) {
		console.error('Error fetching categories:', error);
		sendErrorResponse(res, 'Failed to fetch categories', 500);
	}
};

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a category by ID (Admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
export const getCategoryById = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		const category = await prisma.category.findUnique({
			where: { id },
			include: {
				books: {
					where: {
						isDeleted: false,
					},
					select: {
						id: true,
						title: true,
						author: true,
						isbn: true,
						totalCopies: true,
						availableCopies: true,
					},
				},
				_count: {
					select: {
						books: {
							where: {
								isDeleted: false,
							},
						},
					},
				},
			},
		});

		if (!category) {
			sendErrorResponse(res, 'Category not found', 404);
			return;
		}

		sendSuccessResponse(res, category, 'Category retrieved successfully');
	} catch (error) {
		console.error('Error fetching category:', error);
		sendErrorResponse(res, 'Failed to fetch category', 500);
	}
};

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Conflict - Category name already exists
 */
export const createCategory = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const {
			name,
			description,
		}: {
			name: string;
			description?: string;
		} = req.body;

		// Validation
		if (!name || name.trim().length < 2) {
			sendErrorResponse(
				res,
				'Category name is required and must be at least 2 characters long',
				400
			);
			return;
		}

		if (name.length > 100) {
			sendErrorResponse(
				res,
				'Category name must not exceed 100 characters',
				400
			);
			return;
		}

		if (description && description.length > 500) {
			sendErrorResponse(
				res,
				'Category description must not exceed 500 characters',
				400
			);
			return;
		}

		// Check if category name already exists
		const existingCategory = await prisma.category.findUnique({
			where: { name: name.trim() },
		});

		if (existingCategory) {
			sendErrorResponse(
				res,
				'Category with this name already exists',
				409
			);
			return;
		}

		const category = await prisma.category.create({
			data: {
				name: name.trim(),
				description: description?.trim() || null,
			},
		});

		sendSuccessResponse(
			res,
			category,
			'Category created successfully',
			201
		);
	} catch (error) {
		console.error('Error creating category:', error);
		sendErrorResponse(res, 'Failed to create category', 500);
	}
};

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Conflict - Category name already exists
 */
export const updateCategory = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const { name, description } = req.body;

		// Check if category exists
		const existingCategory = await prisma.category.findUnique({
			where: { id },
		});

		if (!existingCategory) {
			sendErrorResponse(res, 'Category not found', 404);
			return;
		}

		// Validation
		if (name !== undefined) {
			if (!name || name.trim().length < 2) {
				sendErrorResponse(
					res,
					'Category name must be at least 2 characters long',
					400
				);
				return;
			}

			if (name.length > 100) {
				sendErrorResponse(
					res,
					'Category name must not exceed 100 characters',
					400
				);
				return;
			}

			// Check if new name conflicts with existing category
			if (name.trim() !== existingCategory.name) {
				const nameConflict = await prisma.category.findUnique({
					where: { name: name.trim() },
				});

				if (nameConflict) {
					sendErrorResponse(
						res,
						'Category with this name already exists',
						409
					);
					return;
				}
			}
		}

		if (description !== undefined && description.length > 500) {
			sendErrorResponse(
				res,
				'Category description must not exceed 500 characters',
				400
			);
			return;
		}

		const updateData: any = {};
		if (name !== undefined) updateData.name = name.trim();
		if (description !== undefined)
			updateData.description = description?.trim() || null;

		const category = await prisma.category.update({
			where: { id },
			data: updateData,
		});

		sendSuccessResponse(res, category, 'Category updated successfully');
	} catch (error) {
		console.error('Error updating category:', error);
		sendErrorResponse(res, 'Failed to update category', 500);
	}
};

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       400:
 *         description: Bad request - Cannot delete category with books
 */
export const deleteCategory = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		// Check if category exists
		const existingCategory = await prisma.category.findUnique({
			where: { id },
			include: {
				_count: {
					select: {
						books: true,
					},
				},
			},
		});

		if (!existingCategory) {
			sendErrorResponse(res, 'Category not found', 404);
			return;
		}

		// Check if category has any books
		if (existingCategory._count.books > 0) {
			sendErrorResponse(
				res,
				'Cannot delete category that contains books. Please move or delete all books first.',
				400
			);
			return;
		}

		await prisma.category.delete({
			where: { id },
		});

		sendSuccessResponse(res, null, 'Category deleted successfully');
	} catch (error) {
		console.error('Error deleting category:', error);
		sendErrorResponse(res, 'Failed to delete category', 500);
	}
};
