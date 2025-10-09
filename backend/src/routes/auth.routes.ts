import { Router } from 'express';
import {
	adminLogin,
	adminRegister,
	studentLogin,
	studentRegister,
} from '../controllers/auth.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

// Student routes
router.post('/students/register', studentRegister);
router.post('/students/login', studentLogin);

// Admin routes
router.post('/admins/register', adminRegister);
router.post('/admins/login', adminLogin);

export default router;
