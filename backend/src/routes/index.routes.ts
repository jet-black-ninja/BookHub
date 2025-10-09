import { Router } from 'express';
import authRoutes from './auth.routes.js';
import booksRoutes from './books.router.js';
import categoriesRoutes from './categories.router.js';
import studentBooksRoutes from './student-books.router.js';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Categories routes (protected - admin only)
router.use('/categories', categoriesRoutes);

// Books routes (protected - admin only)
router.use('/books', booksRoutes);

// Student routes (protected - student only)
router.use('/student', studentBooksRoutes);

export default router;
