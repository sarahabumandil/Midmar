import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import {
  playerReport,
  playerTrends,
  queueReportEmail,
  createReportRequest,
  listRecentReportRequests,
  teamPerformancePlayersReport,
} from '../controllers/analyticsController.js';

const router = express.Router();

router.use(authenticate);
router.get('/players/:globalId', asyncHandler(playerReport));
router.get('/players/:globalId/trends', asyncHandler(playerTrends));
router.get('/team-performance/players', asyncHandler(teamPerformancePlayersReport));
router.get('/requests', asyncHandler(listRecentReportRequests));
router.post('/requests', asyncHandler(createReportRequest));
router.post('/email', asyncHandler(queueReportEmail));

export default router;
