import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response.js';
import {
	deleteFromCloudinary,
	uploadToCloudinary,
} from '../config/cloudinary.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - isbn
 *         - categoryId
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           description: The book title
 *         author:
 *           type: string
 *           description: The book author
 *         isbn:
 *           type: string
 *           description: The book ISBN (unique)
 *         categoryId:
 *           type: string
 *           description: The category ID this book belongs to
 *         description:
 *           type: string
 *           description: The book description
 *         price:
 *           type: number
 *           description: The book price
 *         totalCopies:
 *           type: integer
 *           description: Total number of copies
 *           default: 3
 *         availableCopies:
 *           type: integer
 *           description: Number of available copies
 *           default: 3
 *         coverImageUrl:
 *           type: string
 *           description: URL to the book cover image
 *         isDeleted:
 *           type: boolean
 *           description: Whether the book is deleted
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Book creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *         Category:
 *           $ref: '#/components/schemas/Category'
 *
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *
 *     CreateBookRequest:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - isbn
 *         - categoryId
 *         - price
 *       properties:
 *         title:
 *           type: string
 *         author:
 *           type: string
 *         isbn:
 *           type: string
 *         categoryId:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         totalCopies:
 *           type: integer
 *           minimum: 1
 *           default: 3
 *         coverImageUrl:
 *           type: string
 *
 *     UpdateBookRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         author:
 *           type: string
 *         isbn:
 *           type: string
 *         categoryId:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         totalCopies:
 *           type: integer
 *           minimum: 1
 *         coverImageUrl:
 *           type: string
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books (Admin)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of books per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search books by title, author, or ISBN
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include deleted books
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     books:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Book'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalBooks:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
export const getAllBooks = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
		const search = req.query.search as string;
		const categoryId = req.query.categoryId as string;
		const includeDeleted = req.query.includeDeleted === 'true';

		const skip = (page - 1) * limit;

		// Build where clause
		const where: any = {};

		if (!includeDeleted) {
			where.isDeleted = false;
		}

		if (categoryId) {
			where.categoryId = categoryId;
		}

		if (search) {
			where.OR = [
				{ title: { contains: search, mode: 'insensitive' } },
				{ author: { contains: search, mode: 'insensitive' } },
				{ isbn: { contains: search, mode: 'insensitive' } },
			];
		}

		const [books, totalCount] = await Promise.all([
			prisma.book.findMany({
				where,
				skip,
				take: limit,
				include: {
					Category: {
						select: {
							id: true,
							name: true,
							description: true,
						},
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
			}),
			prisma.book.count({ where }),
		]);

		const totalPages = Math.ceil(totalCount / limit);

		sendSuccessResponse(
			res,
			{
				books,
				pagination: {
					currentPage: page,
					totalPages,
					totalBooks: totalCount,
					hasNext: page < totalPages,
					hasPrev: page > 1,
				},
			},
			'Books retrieved successfully'
		);
	} catch (error) {
		console.error('Error fetching books:', error);
		sendErrorResponse(res, 'Failed to fetch books', 500);
	}
};

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a book by ID (Admin)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
export const getBookById = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		const book = await prisma.book.findUnique({
			where: { id },
			include: {
				Category: {
					select: {
						id: true,
						name: true,
						description: true,
					},
				},
				Review: {
					include: {
						student: {
							select: {
								id: true,
								fullName: true,
								email: true,
							},
						},
					},
				},
			},
		});

		if (!book) {
			sendErrorResponse(res, 'Book not found', 404);
			return;
		}

		sendSuccessResponse(res, book, 'Book retrieved successfully');
	} catch (error) {
		console.error('Error fetching book:', error);
		sendErrorResponse(res, 'Failed to fetch book', 500);
	}
};

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - isbn
 *               - categoryId
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               totalCopies:
 *                 type: integer
 *                 minimum: 1
 *                 default: 3
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Book cover image file
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Conflict - ISBN already exists
 */
export const createBook = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const {
			title,
			author,
			isbn,
			categoryId,
			description,
			price,
			totalCopies = 3,
		} = req.body;

		// Validation
		if (!title || !author || !isbn || !categoryId || !price) {
			sendErrorResponse(
				res,
				'Missing required fields: title, author, isbn, categoryId, price',
				400
			);
			return;
		}

		if (totalCopies < 1) {
			sendErrorResponse(res, 'Total copies must be at least 1', 400);
			return;
		}

		// Check if category exists
		const category = await prisma.category.findUnique({
			where: { id: categoryId },
		});

		if (!category) {
			sendErrorResponse(res, 'Category not found', 400);
			return;
		}

		// Check if ISBN already exists
		const existingBook = await prisma.book.findUnique({
			where: { isbn },
		});

		if (existingBook) {
			sendErrorResponse(res, 'Book with this ISBN already exists', 409);
			return;
		}

		// Handle cover image upload
		let coverImageUrl = '';
		if (req.file) {
			try {
				coverImageUrl = await uploadToCloudinary(
					req.file.buffer,
					req.file.originalname
				);
			} catch (uploadError) {
				console.error('Error uploading image:', uploadError);
				sendErrorResponse(res, 'Failed to upload cover image', 500);
				return;
			}
		}

		const book = await prisma.book.create({
			data: {
				title,
				author,
				isbn,
				categoryId,
				description,
				price: parseFloat(price),
				totalCopies: parseInt(totalCopies),
				availableCopies: parseInt(totalCopies),
				coverImageUrl: coverImageUrl || null,
			},
			include: {
				Category: {
					select: {
						id: true,
						name: true,
						description: true,
					},
				},
			},
		});

		sendSuccessResponse(res, book, 'Book created successfully', 201);
	} catch (error) {
		console.error('Error creating book:', error);
		sendErrorResponse(res, 'Failed to create book', 500);
	}
};

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               totalCopies:
 *                 type: integer
 *                 minimum: 1
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Book cover image file
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Conflict - ISBN already exists
 */
export const updateBook = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const {
			title,
			author,
			isbn,
			categoryId,
			description,
			price,
			totalCopies,
		} = req.body;

		// Check if book exists
		const existingBook = await prisma.book.findUnique({
			where: { id },
		});

		if (!existingBook) {
			sendErrorResponse(res, 'Book not found', 404);
			return;
		}

		// If ISBN is being updated, check for conflicts
		if (isbn && isbn !== existingBook.isbn) {
			const isbnConflict = await prisma.book.findUnique({
				where: { isbn },
			});

			if (isbnConflict) {
				sendErrorResponse(
					res,
					'Book with this ISBN already exists',
					409
				);
				return;
			}
		}

		// If categoryId is being updated, check if it exists
		if (categoryId && categoryId !== existingBook.categoryId) {
			const category = await prisma.category.findUnique({
				where: { id: categoryId },
			});

			if (!category) {
				sendErrorResponse(res, 'Category not found', 400);
				return;
			}
		}

		// Validate totalCopies if provided
		if (totalCopies !== undefined && parseInt(totalCopies) < 1) {
			sendErrorResponse(res, 'Total copies must be at least 1', 400);
			return;
		}

		// Calculate new available copies if total copies changed
		let availableCopies = existingBook.availableCopies;
		if (
			totalCopies !== undefined &&
			parseInt(totalCopies) !== existingBook.totalCopies
		) {
			const borrowedCopies =
				existingBook.totalCopies - existingBook.availableCopies;
			availableCopies = Math.max(
				0,
				parseInt(totalCopies) - borrowedCopies
			);
		}

		// Handle cover image upload
		let coverImageUrl = existingBook.coverImageUrl;
		if (req.file) {
			try {
				// Delete old image if it exists
				if (existingBook.coverImageUrl) {
					await deleteFromCloudinary(existingBook.coverImageUrl);
				}

				// Upload new image
				coverImageUrl = await uploadToCloudinary(
					req.file.buffer,
					req.file.originalname
				);
			} catch (uploadError) {
				console.error('Error uploading image:', uploadError);
				sendErrorResponse(res, 'Failed to upload cover image', 500);
				return;
			}
		}

		const updateData: any = {};
		if (title !== undefined) updateData.title = title;
		if (author !== undefined) updateData.author = author;
		if (isbn !== undefined) updateData.isbn = isbn;
		if (categoryId !== undefined) updateData.categoryId = categoryId;
		if (description !== undefined) updateData.description = description;
		if (price !== undefined) updateData.price = parseFloat(price);
		if (totalCopies !== undefined) {
			updateData.totalCopies = parseInt(totalCopies);
			updateData.availableCopies = availableCopies;
		}
		if (req.file) {
			updateData.coverImageUrl = coverImageUrl;
		}

		const book = await prisma.book.update({
			where: { id },
			data: updateData,
			include: {
				Category: {
					select: {
						id: true,
						name: true,
						description: true,
					},
				},
			},
		});

		sendSuccessResponse(res, book, 'Book updated successfully');
	} catch (error) {
		console.error('Error updating book:', error);
		sendErrorResponse(res, 'Failed to update book', 500);
	}
};

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *       - in: query
 *         name: permanent
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Permanently delete the book (cannot be undone)
 *     responses:
 *       200:
 *         description: Book deleted successfully
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
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       400:
 *         description: Bad request - Cannot delete book with active borrowings
 */
export const deleteBook = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const permanent = req.query.permanent === 'true';

		// Check if book exists
		const existingBook = await prisma.book.findUnique({
			where: { id },
			include: {
				BorrowedBook: {
					include: {
						borrowing: true,
					},
				},
			},
		});

		if (!existingBook) {
			sendErrorResponse(res, 'Book not found', 404);
			return;
		}

		// Check for active borrowings
		const activeBorrowings = existingBook.BorrowedBook.filter(
			(bb) => !bb.returned && bb.borrowing.status === 'ACTIVE'
		);

		if (activeBorrowings.length > 0 && permanent) {
			sendErrorResponse(
				res,
				'Cannot permanently delete book with active borrowings',
				400
			);
			return;
		}

		if (permanent) {
			// Delete cover image from cloudinary if it exists
			if (existingBook.coverImageUrl) {
				await deleteFromCloudinary(existingBook.coverImageUrl);
			}

			// Permanent deletion
			await prisma.book.delete({
				where: { id },
			});
			sendSuccessResponse(res, null, 'Book permanently deleted');
		} else {
			// Soft deletion
			await prisma.book.update({
				where: { id },
				data: { isDeleted: true },
			});
			sendSuccessResponse(res, null, 'Book deleted successfully');
		}
	} catch (error) {
		console.error('Error deleting book:', error);
		sendErrorResponse(res, 'Failed to delete book', 500);
	}
};

/**
 * @swagger
 * /api/books/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted book (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
export const restoreBook = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		const existingBook = await prisma.book.findUnique({
			where: { id },
		});

		if (!existingBook) {
			sendErrorResponse(res, 'Book not found', 404);
			return;
		}

		if (!existingBook.isDeleted) {
			sendErrorResponse(res, 'Book is not deleted', 400);
			return;
		}

		const book = await prisma.book.update({
			where: { id },
			data: { isDeleted: false },
			include: {
				Category: {
					select: {
						id: true,
						name: true,
						description: true,
					},
				},
			},
		});

		sendSuccessResponse(res, book, 'Book restored successfully');
	} catch (error) {
		console.error('Error restoring book:', error);
		sendErrorResponse(res, 'Failed to restore book', 500);
	}
};
