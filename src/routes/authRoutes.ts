import { Router } from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, getUserProfile);

export default router;
