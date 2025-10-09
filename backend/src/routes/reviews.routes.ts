import { Router } from 'express';
import {
	createReview,
	deleteReview,
	getBookReviews,
	getUserReviews,
	updateReview,
} from '../controllers/reviews.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

// All review routes require authentication
router.use(authenticateJWT);

// Create a new review with optional image upload
router.post('/', upload.single('image'), createReview);

// Get current user's reviews
router.get('/', getUserReviews);

// Get all reviews for a specific book (public for authenticated users)
router.get('/book/:bookId', getBookReviews);

// Update a review with optional image upload
router.put('/:reviewId', upload.single('image'), updateReview);

// Delete a review
router.delete('/:reviewId', deleteReview);

export default router;
