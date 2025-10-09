import { Router } from 'express';
import {
	borrowBook,
	createReview,
	deleteReview,
	getAvailableBooks,
	getBookDetails,
	getCategories,
	getMyBorrowings,
	getMyReviews,
	returnBook,
	updateReview,
} from '../controllers/student-books.controller.js';
import {
	authenticateJWT,
	authorizeRoles,
} from '../middlewares/auth.middleware.js';
import { UserRole } from '../generated/prisma/enums.js';

const router = Router();

// All routes require authentication and student role
router.use(authenticateJWT);
router.use(authorizeRoles(UserRole.STUDENT));

// Book browsing routes
router.get('/books', getAvailableBooks);
router.get('/books/:id', getBookDetails);
router.get('/categories', getCategories);

// Borrowing routes
router.post('/borrow', borrowBook);
router.get('/my-borrowings', getMyBorrowings);
router.patch('/return/:borrowingId', returnBook);

// Review routes
router.post('/reviews', createReview);
router.get('/reviews', getMyReviews);
router.put('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);

export default router;
