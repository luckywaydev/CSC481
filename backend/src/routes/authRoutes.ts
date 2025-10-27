// Auth Routes
import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', register);

// POST /api/v1/auth/login
router.post('/login', login);

export default router;
