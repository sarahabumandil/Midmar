import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { authenticate, isAnalyst } from '../middleware/auth.js';
import { bulkSetupPlayers } from '../controllers/playersController.js';

const router = express.Router();

router.use(authenticate, isAnalyst);
router.post('/players/bulk', asyncHandler(bulkSetupPlayers));

export default router;
