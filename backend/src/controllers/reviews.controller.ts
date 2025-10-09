import { Response } from 'express';
import prisma from '../config/database.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { uploadReviewImageToCloudinary } from '../config/cloudinary.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     ReviewRequest:
 *       type: object
 *       required:
 *         - bookId
 *         - title
 *         - content
 *         - rating
 *       properties:
 *         bookId:
 *           type: string
 *           description: The ID of the book being reviewed
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: Review title
 *         content:
 *           type: string
 *           maxLength: 1000
 *           description: Review content
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Rating from 1 to 5
 *     ReviewResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         rating:
 *           type: integer
 *         imageUrl:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         book:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             title:
 *               type: string
 *             author:
 *               type: string
 *         student:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a book review with optional image upload
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *               - title
 *               - content
 *               - rating
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: The ID of the book being reviewed
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Review title
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Review content
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional review image (max 5MB)
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ReviewResponse'
 *       400:
 *         description: Bad request - validation error or review already exists
 *       404:
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 */
export const createReview = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const { bookId, title, content, rating } = req.body as {
			bookId: string;
			title: string;
			content: string;
			rating: string;
		};
		const currentUserId = req.userId!;
		const imageFile = req.file;

		// Validation
		if (!bookId || !title || !content || !rating) {
			sendErrorResponse(
				res,
				'Missing required fields: bookId, title, content, rating',
				400
			);
			return;
		}

		const ratingNum = parseInt(rating);
		if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
			sendErrorResponse(res, 'Rating must be between 1 and 5', 400);
			return;
		}

		if (title.length > 200) {
			sendErrorResponse(
				res,
				'Review title must not exceed 200 characters',
				400
			);
			return;
		}

		if (content.length > 1000) {
			sendErrorResponse(
				res,
				'Review content must not exceed 1000 characters',
				400
			);
			return;
		}

		// Check if book exists
		const book = await prisma.book.findUnique({
			where: { id: bookId, isDeleted: false },
			select: { id: true, title: true, author: true },
		});

		if (!book) {
			sendErrorResponse(res, 'Book not found', 404);
			return;
		}

		// Check if user already reviewed this book
		const existingReview = await prisma.review.findUnique({
			where: {
				bookId_studentId: {
					bookId,
					studentId: currentUserId,
				},
			},
		});

		if (existingReview) {
			sendErrorResponse(res, 'You have already reviewed this book', 400);
			return;
		}

		// Upload image to cloudinary if provided
		let imageUrl: string | null = null;
		if (imageFile) {
			try {
				imageUrl = await uploadReviewImageToCloudinary(
					imageFile.buffer,
					imageFile.originalname
				);
			} catch (error) {
				console.error('Error uploading image:', error);
				sendErrorResponse(res, 'Failed to upload image', 500);
				return;
			}
		}

		// Create review
		const review = await prisma.review.create({
			data: {
				bookId,
				studentId: currentUserId,
				title: title.trim(),
				content: content.trim(),
				rating: ratingNum,
				imageUrl,
			},
			include: {
				book: {
					select: {
						id: true,
						title: true,
						author: true,
					},
				},
				student: {
					select: {
						id: true,
						fullName: true,
						email: true,
					},
				},
			},
		});

		sendSuccessResponse(res, review, 'Review created successfully', 201);
	} catch (error) {
		console.error('Error creating review:', error);
		sendErrorResponse(res, 'Failed to create review', 500);
	}
};

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get current user's reviews
 *     tags: [Reviews]
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
 *         description: Number of reviews per page
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     reviews:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ReviewResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
export const getUserReviews = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const currentUserId = req.userId!;
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const skip = (page - 1) * limit;

		// Get total count
		const totalReviews = await prisma.review.count({
			where: { studentId: currentUserId },
		});

		// Get reviews with pagination
		const reviews = await prisma.review.findMany({
			where: { studentId: currentUserId },
			include: {
				book: {
					select: {
						id: true,
						title: true,
						author: true,
					},
				},
				student: {
					select: {
						id: true,
						fullName: true,
						email: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
			skip,
			take: limit,
		});

		const totalPages = Math.ceil(totalReviews / limit);

		sendSuccessResponse(
			res,
			{
				reviews,
				pagination: {
					page,
					limit,
					total: totalReviews,
					pages: totalPages,
				},
			},
			'Reviews retrieved successfully'
		);
	} catch (error) {
		console.error('Error fetching user reviews:', error);
		sendErrorResponse(res, 'Failed to fetch reviews', 500);
	}
};

/**
 * @swagger
 * /api/reviews/book/{bookId}:
 *   get:
 *     summary: Get all reviews for a specific book
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
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
 *         description: Number of reviews per page
 *     responses:
 *       200:
 *         description: Book reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     reviews:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ReviewResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                     averageRating:
 *                       type: number
 *                       format: float
 *                     totalReviews:
 *                       type: integer
 *       404:
 *         description: Book not found
 */
export const getBookReviews = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const { bookId } = req.params;
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const skip = (page - 1) * limit;

		// Check if book exists
		const book = await prisma.book.findUnique({
			where: { id: bookId, isDeleted: false },
			select: { id: true },
		});

		if (!book) {
			sendErrorResponse(res, 'Book not found', 404);
			return;
		}

		// Get total count and average rating
		const [totalReviews, reviews] = await Promise.all([
			prisma.review.count({
				where: { bookId },
			}),
			prisma.review.findMany({
				where: { bookId },
				include: {
					book: {
						select: {
							id: true,
							title: true,
							author: true,
						},
					},
					student: {
						select: {
							id: true,
							fullName: true,
							email: true,
						},
					},
				},
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
			}),
		]);

		// Calculate average rating
		const allReviews = await prisma.review.findMany({
			where: { bookId },
			select: { rating: true },
		});

		const averageRating =
			allReviews.length > 0
				? allReviews.reduce(
						(sum: number, review: { rating: number }) =>
							sum + review.rating,
						0
					) / allReviews.length
				: 0;

		const totalPages = Math.ceil(totalReviews / limit);

		sendSuccessResponse(
			res,
			{
				reviews,
				pagination: {
					page,
					limit,
					total: totalReviews,
					pages: totalPages,
				},
				averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
				totalReviews,
			},
			'Book reviews retrieved successfully'
		);
	} catch (error) {
		console.error('Error fetching book reviews:', error);
		sendErrorResponse(res, 'Failed to fetch book reviews', 500);
	}
};

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   put:
 *     summary: Update a review with optional image upload
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Review title
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Review content
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional review image (max 5MB)
 *               removeImage:
 *                 type: boolean
 *                 description: Set to true to remove existing image
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ReviewResponse'
 *       400:
 *         description: Bad request - validation error
 *       403:
 *         description: Forbidden - not the review owner
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 */
export const updateReview = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const { reviewId } = req.params;
		const { title, content, rating, removeImage } = req.body;
		const currentUserId = req.userId!;
		const imageFile = req.file;

		// Check if review exists and belongs to user
		const existingReview = await prisma.review.findUnique({
			where: { id: reviewId },
		});

		if (!existingReview) {
			sendErrorResponse(res, 'Review not found', 404);
			return;
		}

		if (existingReview.studentId !== currentUserId) {
			sendErrorResponse(res, 'You can only update your own reviews', 403);
			return;
		}

		// Validation
		const updateData: any = {};

		if (title !== undefined) {
			if (title.length > 200) {
				sendErrorResponse(
					res,
					'Review title must not exceed 200 characters',
					400
				);
				return;
			}
			updateData.title = title.trim();
		}

		if (content !== undefined) {
			if (content.length > 1000) {
				sendErrorResponse(
					res,
					'Review content must not exceed 1000 characters',
					400
				);
				return;
			}
			updateData.content = content.trim();
		}

		if (rating !== undefined) {
			const ratingNum = parseInt(rating);
			if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
				sendErrorResponse(res, 'Rating must be between 1 and 5', 400);
				return;
			}
			updateData.rating = ratingNum;
		}

		// Handle image updates
		if (removeImage === 'true') {
			updateData.imageUrl = null;
		} else if (imageFile) {
			try {
				const imageUrl = await uploadReviewImageToCloudinary(
					imageFile.buffer,
					imageFile.originalname
				);
				updateData.imageUrl = imageUrl;
			} catch (error) {
				console.error('Error uploading image:', error);
				sendErrorResponse(res, 'Failed to upload image', 500);
				return;
			}
		}

		// Update review
		const updatedReview = await prisma.review.update({
			where: { id: reviewId },
			data: updateData,
			include: {
				book: {
					select: {
						id: true,
						title: true,
						author: true,
					},
				},
				student: {
					select: {
						id: true,
						fullName: true,
						email: true,
					},
				},
			},
		});

		sendSuccessResponse(res, updatedReview, 'Review updated successfully');
	} catch (error) {
		console.error('Error updating review:', error);
		sendErrorResponse(res, 'Failed to update review', 500);
	}
};

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Forbidden - not the review owner
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 */
export const deleteReview = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const { reviewId } = req.params;
		const currentUserId = req.userId!;

		// Check if review exists and belongs to user
		const existingReview = await prisma.review.findUnique({
			where: { id: reviewId },
		});

		if (!existingReview) {
			sendErrorResponse(res, 'Review not found', 404);
			return;
		}

		if (existingReview.studentId !== currentUserId) {
			sendErrorResponse(res, 'You can only delete your own reviews', 403);
			return;
		}

		// Delete review
		await prisma.review.delete({
			where: { id: reviewId },
		});

		sendSuccessResponse(res, null, 'Review deleted successfully');
	} catch (error) {
		console.error('Error deleting review:', error);
		sendErrorResponse(res, 'Failed to delete review', 500);
	}
};
