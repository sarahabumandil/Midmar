import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { authenticate, isAnalyst } from '../middleware/auth.js';
import {
  createMatch,
  listMatches,
  saveRawInsights,
  mapTempIds,
  finalizeMatch,
  commitVideoAnalysis,
} from '../controllers/matchController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(listMatches));
router.post('/', isAnalyst, asyncHandler(createMatch));
router.post('/commit-video-analysis', isAnalyst, asyncHandler(commitVideoAnalysis));
router.post('/:matchId/raw-insights', isAnalyst, asyncHandler(saveRawInsights));
router.post('/:matchId/map-ids', isAnalyst, asyncHandler(mapTempIds));
router.post('/:matchId/finalize', isAnalyst, asyncHandler(finalizeMatch));

export default router;
