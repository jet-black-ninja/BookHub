import { Router } from 'express';
import {
	createBook,
	deleteBook,
	getAllBooks,
	getBookById,
	restoreBook,
	updateBook,
} from '../controllers/books.controller.js';
import {
	authenticateJWT,
	authorizeRoles,
} from '../middlewares/auth.middleware.js';
import { UserRole } from '../generated/prisma/enums.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateJWT);
router.use(authorizeRoles(UserRole.ADMIN));

// GET /api/books - Get all books with pagination and filters
router.get('/', getAllBooks);

// GET /api/books/:id - Get a specific book by ID
router.get('/:id', getBookById);

// POST /api/books - Create a new book (with file upload)
router.post('/', upload.single('coverImage'), createBook);

// PUT /api/books/:id - Update a book (with file upload)
router.put('/:id', upload.single('coverImage'), updateBook);

// DELETE /api/books/:id - Delete a book (soft delete by default)
router.delete('/:id', deleteBook);

// PATCH /api/books/:id/restore - Restore a soft-deleted book
router.patch('/:id/restore', restoreBook);

export default router;
