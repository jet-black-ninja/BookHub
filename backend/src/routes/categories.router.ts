import { Router } from 'express';
import {
	createCategory,
	deleteCategory,
	getAllCategories,
	getCategoryById,
	updateCategory,
} from '../controllers/categories.controller.js';
import {
	authenticateJWT,
	authorizeRoles,
} from '../middlewares/auth.middleware.js';
import { UserRole } from '../generated/prisma/enums.js';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateJWT);
router.use(authorizeRoles(UserRole.ADMIN));

// GET /api/categories - Get all categories
router.get('/', getAllCategories);

// GET /api/categories/:id - Get a specific category by ID
router.get('/:id', getCategoryById);

// POST /api/categories - Create a new category
router.post('/', createCategory);

// PUT /api/categories/:id - Update a category
router.put('/:id', updateCategory);

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', deleteCategory);

export default router;
