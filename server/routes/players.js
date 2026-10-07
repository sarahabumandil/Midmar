import express from 'express';
import { authenticate, isAnalyst, isAdmin } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import {
  listPlayers,
  createPlayer,
  bulkSetupPlayers,
  updatePlayer,
  deletePlayer,
  resetPredictionData,
  getResetLogs,
  updateInactivityThreshold,
} from '../controllers/playersController.js';

const router = express.Router();

// All player routes require authentication
router.use(authenticate);

router.get('/', asyncHandler(listPlayers));
router.post('/', isAnalyst, asyncHandler(createPlayer));
router.post('/setup-bulk', isAnalyst, asyncHandler(bulkSetupPlayers));
router.patch('/inactivity-threshold', isAdmin, asyncHandler(updateInactivityThreshold));
router.put('/:id', isAnalyst, asyncHandler(updatePlayer));
router.delete('/:id', isAnalyst, asyncHandler(deletePlayer));
router.post('/:id/reset-prediction-data', isAnalyst, asyncHandler(resetPredictionData));
router.get('/:id/reset-logs', asyncHandler(getResetLogs));

export default router;

