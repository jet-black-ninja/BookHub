import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

export default router;
