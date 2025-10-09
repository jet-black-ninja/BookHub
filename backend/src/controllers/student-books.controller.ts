import { Response } from 'express';
import prisma from '../config/database.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     PublicBook:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         author:
 *           type: string
 *         isbn:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         availableCopies:
 *           type: integer
 *         coverImageUrl:
 *           type: string
 *         Category:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             description:
 *               type: string
 *         averageRating:
 *           type: number
 *         totalReviews:
 *           type: integer
 *
 *     BorrowRequest:
 *       type: object
 *       required:
 *         - bookId
 *         - borrowType
 *       properties:
 *         bookId:
 *           type: string
 *         borrowType:
 *           type: string
 *           enum: [INDIVIDUAL, GROUP]
 *         studentEmails:
 *           type: array
 *           items:
 *             type: string
 *           description: Required only for GROUP borrowing
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Optional, defaults to 14 days from now
 */

/**
 * @swagger
 * /api/student/books:
 *   get:
 *     summary: Get all available books for students
 *     tags: [Student Books]
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
 *           maximum: 50
 *           default: 10
 *         description: Number of books per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search books by title or author
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, author, createdAt, rating]
 *           default: createdAt
 *         description: Sort books by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         books:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/PublicBook'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             currentPage:
 *                               type: integer
 *                             totalPages:
 *                               type: integer
 *                             totalBooks:
 *                               type: integer
 *                             hasNext:
 *                               type: boolean
 *                             hasPrev:
 *                               type: boolean
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getAvailableBooks = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
		const search = req.query.search as string;
		const categoryId = req.query.categoryId as string;
		const sortBy = (req.query.sortBy as string) || 'createdAt';
		const sortOrder = (req.query.sortOrder as string) || 'desc';

		const skip = (page - 1) * limit;

		// Build where clause
		const where: any = {
			isDeleted: false,
			availableCopies: {
				gt: 0,
			},
		};

		if (categoryId) {
			where.categoryId = categoryId;
		}

		if (search) {
			where.OR = [
				{ title: { contains: search, mode: 'insensitive' } },
				{ author: { contains: search, mode: 'insensitive' } },
			];
		}

		// Build orderBy clause
		let orderBy: any = {};
		if (sortBy === 'rating') {
			// For rating, we'll handle this in a special way after fetching
			orderBy = { createdAt: sortOrder };
		} else {
			orderBy[sortBy] = sortOrder;
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
					Review: {
						select: {
							rating: true,
						},
					},
				},
				orderBy,
			}),
			prisma.book.count({ where }),
		]);

		// Calculate average rating and total reviews for each book
		const booksWithRatings = books.map((book) => {
			const reviews = book.Review;
			const totalReviews = reviews.length;
			const averageRating =
				totalReviews > 0
					? reviews.reduce((sum, review) => sum + review.rating, 0) /
						totalReviews
					: 0;

			const { Review: _, ...bookData } = book;
			return {
				...bookData,
				averageRating: parseFloat(averageRating.toFixed(1)),
				totalReviews,
			};
		});

		// Sort by rating if requested
		if (sortBy === 'rating') {
			booksWithRatings.sort((a, b) => {
				if (sortOrder === 'desc') {
					return b.averageRating - a.averageRating;
				} else {
					return a.averageRating - b.averageRating;
				}
			});
		}

		const totalPages = Math.ceil(totalCount / limit);

		sendSuccessResponse(
			res,
			{
				books: booksWithRatings,
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
 * /api/student/books/{id}:
 *   get:
 *     summary: Get a specific book details for students
 *     tags: [Student Books]
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
 *         description: Book details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/PublicBook'
 *                     - type: object
 *                       properties:
 *                         reviews:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               content:
 *                                 type: string
 *                               rating:
 *                                 type: integer
 *                               createdAt:
 *                                 type: string
 *                               student:
 *                                 type: object
 *                                 properties:
 *                                   fullName:
 *                                     type: string
 *       404:
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 */
export const getBookDetails = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		const book = await prisma.book.findUnique({
			where: {
				id,
				isDeleted: false,
			},
			include: {
				Category: {
					select: {
						id: true,
						name: true,
						description: true,
					},
				},
				Review: {
					select: {
						id: true,
						title: true,
						content: true,
						rating: true,
						createdAt: true,
						student: {
							select: {
								fullName: true,
							},
						},
					},
					orderBy: {
						createdAt: 'desc',
					},
				},
			},
		});

		if (!book) {
			sendErrorResponse(res, 'Book not found', 404);
			return;
		}

		// Calculate average rating
		const reviews = book.Review;
		const totalReviews = reviews.length;
		const averageRating =
			totalReviews > 0
				? reviews.reduce((sum, review) => sum + review.rating, 0) /
					totalReviews
				: 0;

		const bookWithRating = {
			...book,
			averageRating: parseFloat(averageRating.toFixed(1)),
			totalReviews,
			reviews,
		};

		sendSuccessResponse(
			res,
			bookWithRating,
			'Book details retrieved successfully'
		);
	} catch (error) {
		console.error('Error fetching book details:', error);
		sendErrorResponse(res, 'Failed to fetch book details', 500);
	}
};

/**
 * @swagger
 * /api/student/categories:
 *   get:
 *     summary: Get all categories for students (picklist)
 *     tags: [Student Books]
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       availableBooks:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 */
export const getCategories = async (
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
								availableCopies: {
									gt: 0,
								},
							},
						},
					},
				},
			},
			orderBy: {
				name: 'asc',
			},
		});

		const categoriesWithCount = categories.map((category) => ({
			id: category.id,
			name: category.name,
			description: category.description,
			availableBooks: category._count.books,
		}));

		sendSuccessResponse(
			res,
			categoriesWithCount,
			'Categories retrieved successfully'
		);
	} catch (error) {
		console.error('Error fetching categories:', error);
		sendErrorResponse(res, 'Failed to fetch categories', 500);
	}
};

/**
 * @swagger
 * /api/student/borrow:
 *   post:
 *     summary: Borrow a book (individual or group)
 *     tags: [Student Borrowing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BorrowRequest'
 *     responses:
 *       201:
 *         description: Book borrowed successfully
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
 *                     borrowingId:
 *                       type: string
 *                     bookTitle:
 *                       type: string
 *                     borrowType:
 *                       type: string
 *                     dueDate:
 *                       type: string
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                           fullName:
 *                             type: string
 *       400:
 *         description: Bad request - validation error or borrowing restrictions
 *       404:
 *         description: Book or student not found
 *       401:
 *         description: Unauthorized
 */
export const borrowBook = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const { bookId, borrowType, studentEmails, dueDate } = req.body;
		const currentUserId = req.userId!;

		// Validation
		if (!bookId || !borrowType) {
			sendErrorResponse(
				res,
				'Missing required fields: bookId, borrowType',
				400
			);
			return;
		}

		if (!['INDIVIDUAL', 'GROUP'].includes(borrowType)) {
			sendErrorResponse(
				res,
				'Invalid borrowType. Must be INDIVIDUAL or GROUP',
				400
			);
			return;
		}

		if (
			borrowType === 'GROUP' &&
			(!studentEmails ||
				!Array.isArray(studentEmails) ||
				studentEmails.length === 0)
		) {
			sendErrorResponse(
				res,
				'Student emails are required for group borrowing',
				400
			);
			return;
		}

		// Check if book exists and is available
		const book = await prisma.book.findUnique({
			where: { id: bookId, isDeleted: false },
			include: { Category: true },
		});

		if (!book) {
			sendErrorResponse(res, 'Book not found or unavailable', 404);
			return;
		}

		if (book.availableCopies <= 0) {
			sendErrorResponse(res, 'Book is currently out of stock', 400);
			return;
		}

		// Prepare student IDs array
		let studentIds = [currentUserId];
		let studentsInfo = [];

		// Get current user info
		const currentUser = await prisma.user.findUnique({
			where: { id: currentUserId },
			select: { email: true, fullName: true },
		});

		if (!currentUser) {
			sendErrorResponse(res, 'Current user not found', 404);
			return;
		}

		studentsInfo.push(currentUser);

		// For group borrowing, validate and get additional students
		if (borrowType === 'GROUP') {
			// Remove current user's email if included in the list
			const otherStudentEmails = studentEmails.filter(
				(email: string) =>
					email.toLowerCase() !== currentUser.email.toLowerCase()
			);

			if (otherStudentEmails.length === 0) {
				sendErrorResponse(
					res,
					'At least one other student email is required for group borrowing',
					400
				);
				return;
			}

			// Validate all student emails
			const otherStudents = await prisma.user.findMany({
				where: {
					email: { in: otherStudentEmails },
					role: 'STUDENT',
					isVerified: true,
					isDeleted: false,
				},
				select: { id: true, email: true, fullName: true },
			});

			if (otherStudents.length !== otherStudentEmails.length) {
				const foundEmails = otherStudents.map((s) => s.email);
				const notFoundEmails = otherStudentEmails.filter(
					(email: string) => !foundEmails.includes(email)
				);
				sendErrorResponse(
					res,
					`Some student emails not found or invalid: ${notFoundEmails.join(', ')}`,
					400
				);
				return;
			}

			studentIds.push(...otherStudents.map((s) => s.id));
			studentsInfo.push(...otherStudents);
		}

		// Check if any of the students have active borrowings
		const activeBorrowings = await prisma.borrowingStudent.findMany({
			where: {
				studentId: { in: studentIds },
				borrowing: {
					status: 'ACTIVE',
				},
			},
			include: {
				borrowing: {
					include: {
						BorrowedBook: {
							include: {
								book: {
									select: { title: true },
								},
							},
						},
					},
				},
				student: {
					select: { fullName: true, email: true },
				},
			},
		});

		if (activeBorrowings.length > 0) {
			const borrowingDetails = activeBorrowings.map(
				(ab) =>
					`${ab.student.fullName} (${ab.student.email}) has an active borrowing for "${ab.borrowing.BorrowedBook[0]?.book.title}"`
			);
			sendErrorResponse(
				res,
				`Cannot borrow: ${borrowingDetails.join(', ')}`,
				400
			);
			return;
		}

		// Calculate due date (default to 14 days from now)
		const borrowDueDate = dueDate
			? new Date(dueDate)
			: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

		// Validate due date
		if (borrowDueDate <= new Date()) {
			sendErrorResponse(res, 'Due date must be in the future', 400);
			return;
		}

		// Create the borrowing transaction
		const result = await prisma.$transaction(async (tx) => {
			// Create borrowing record
			const borrowing = await tx.borrowing.create({
				data: {
					studentIds,
					borrowType,
					dueDate: borrowDueDate,
					status: 'ACTIVE',
				},
			});

			// Create borrowed book record
			await tx.borrowedBook.create({
				data: {
					borrowingId: borrowing.id,
					bookId: book.id,
				},
			});

			// Create borrowing student records
			await tx.borrowingStudent.createMany({
				data: studentIds.map((studentId) => ({
					borrowingId: borrowing.id,
					studentId,
				})),
			});

			// Update book available copies
			await tx.book.update({
				where: { id: book.id },
				data: {
					availableCopies: {
						decrement: 1,
					},
				},
			});

			return borrowing;
		});

		sendSuccessResponse(
			res,
			{
				borrowingId: result.id,
				bookTitle: book.title,
				borrowType: result.borrowType,
				dueDate: result.dueDate,
				students: studentsInfo,
			},
			'Book borrowed successfully',
			201
		);
	} catch (error) {
		console.error('Error borrowing book:', error);
		sendErrorResponse(res, 'Failed to borrow book', 500);
	}
};

/**
 * @swagger
 * /api/student/my-borrowings:
 *   get:
 *     summary: Get current user's borrowing history
 *     tags: [Student Borrowing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, RETURNED, OVERDUE, LOST]
 *         description: Filter by borrowing status
 *     responses:
 *       200:
 *         description: Borrowing history retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       borrowType:
 *                         type: string
 *                       borrowDate:
 *                         type: string
 *                       dueDate:
 *                         type: string
 *                       returnDate:
 *                         type: string
 *                       status:
 *                         type: string
 *                       totalFine:
 *                         type: number
 *                       book:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           author:
 *                             type: string
 *                           coverImageUrl:
 *                             type: string
 *                       students:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             fullName:
 *                               type: string
 *                             email:
 *                               type: string
 *       401:
 *         description: Unauthorized
 */
export const getMyBorrowings = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const currentUserId = req.userId!;
		const status = req.query.status as string;

		const whereClause: any = {
			studentId: currentUserId,
		};

		if (status) {
			whereClause.borrowing = {
				status,
			};
		}

		const borrowings = await prisma.borrowingStudent.findMany({
			where: whereClause,
			include: {
				borrowing: {
					include: {
						BorrowedBook: {
							include: {
								book: {
									select: {
										title: true,
										author: true,
										coverImageUrl: true,
									},
								},
							},
						},
						students: {
							include: {
								student: {
									select: {
										fullName: true,
										email: true,
									},
								},
							},
						},
					},
				},
			},
			orderBy: {
				borrowing: {
					borrowDate: 'desc',
				},
			},
		});

		const formattedBorrowings = borrowings.map((bs) => {
			const borrowing = bs.borrowing;
			return {
				id: borrowing.id,
				borrowType: borrowing.borrowType,
				borrowDate: borrowing.borrowDate,
				dueDate: borrowing.dueDate,
				returnDate: borrowing.returnDate,
				status: borrowing.status,
				totalFine: borrowing.totalFine,
				book: borrowing.BorrowedBook[0]?.book || null,
				students: borrowing.students.map((s) => s.student),
			};
		});

		sendSuccessResponse(
			res,
			formattedBorrowings,
			'Borrowing history retrieved successfully'
		);
	} catch (error) {
		console.error('Error fetching borrowing history:', error);
		sendErrorResponse(res, 'Failed to fetch borrowing history', 500);
	}
};

/**
 * @swagger
 * /api/student/return/{borrowingId}:
 *   patch:
 *     summary: Return a borrowed book
 *     tags: [Student Borrowing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: borrowingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Borrowing ID
 *     responses:
 *       200:
 *         description: Book returned successfully
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
 *                     borrowingId:
 *                       type: string
 *                     returnDate:
 *                       type: string
 *                     fine:
 *                       type: number
 *                     isOverdue:
 *                       type: boolean
 *       400:
 *         description: Bad request - book already returned or invalid borrowing
 *       404:
 *         description: Borrowing not found
 *       401:
 *         description: Unauthorized
 */
export const returnBook = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const { borrowingId } = req.params;
		const currentUserId = req.userId!;

		// Check if borrowing exists and user is part of it
		const borrowingStudent = await prisma.borrowingStudent.findFirst({
			where: {
				borrowingId,
				studentId: currentUserId,
			},
			include: {
				borrowing: {
					include: {
						BorrowedBook: {
							include: {
								book: true,
							},
						},
					},
				},
			},
		});

		if (!borrowingStudent) {
			sendErrorResponse(
				res,
				'Borrowing not found or you are not authorized to return this book',
				404
			);
			return;
		}

		const borrowing = borrowingStudent.borrowing;

		if (borrowing.status !== 'ACTIVE') {
			sendErrorResponse(
				res,
				'This book has already been returned or is not active',
				400
			);
			return;
		}

		const returnDate = new Date();
		const dueDate = new Date(borrowing.dueDate);
		const isOverdue = returnDate > dueDate;

		// Calculate fine if overdue
		let fine = 0;
		if (isOverdue) {
			const overdueDays = Math.ceil(
				(returnDate.getTime() - dueDate.getTime()) /
					(1000 * 60 * 60 * 24)
			);

			// Get fine configuration
			const fineConfig = await prisma.fineConfig.findFirst();
			const dailyFine = fineConfig?.dailyFine || 50; // Default 50 per day

			fine = parseFloat(
				(overdueDays * parseFloat(dailyFine.toString())).toFixed(2)
			);
		}

		// Update borrowing in transaction
		const result = await prisma.$transaction(async (tx) => {
			// Update borrowing status
			const updatedBorrowing = await tx.borrowing.update({
				where: { id: borrowingId },
				data: {
					status: isOverdue ? 'OVERDUE' : 'RETURNED',
					returnDate,
					totalFine: fine,
				},
			});

			// Mark borrowed book as returned
			await tx.borrowedBook.updateMany({
				where: { borrowingId },
				data: { returned: true },
			});

			// Increment available copies
			const borrowedBook = borrowing.BorrowedBook[0];
			if (borrowedBook) {
				await tx.book.update({
					where: { id: borrowedBook.bookId },
					data: {
						availableCopies: {
							increment: 1,
						},
					},
				});
			}

			return updatedBorrowing;
		});

		sendSuccessResponse(
			res,
			{
				borrowingId: result.id,
				returnDate: result.returnDate,
				fine,
				isOverdue,
			},
			'Book returned successfully'
		);
	} catch (error) {
		console.error('Error returning book:', error);
		sendErrorResponse(res, 'Failed to return book', 500);
	}
};
