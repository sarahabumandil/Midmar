import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { signup, login, verify } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));
router.get('/verify', asyncHandler(verify));

export default router;
