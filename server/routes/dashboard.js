import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { authenticate, isAdmin, isAnalyst } from '../middleware/auth.js';
import {
  analystDashboard,
  adminDashboard,
  dashboardRiskOverview,
  dashboardPerformanceTrends,
  dashboardRecentActivity,
} from '../controllers/analyticsController.js';

const router = express.Router();

router.use(authenticate);
router.get('/analyst', isAnalyst, asyncHandler(analystDashboard));
router.get('/admin', isAdmin, asyncHandler(adminDashboard));
router.get('/risk-overview', isAnalyst, asyncHandler(dashboardRiskOverview));
router.get('/performance-trends', isAnalyst, asyncHandler(dashboardPerformanceTrends));
router.get('/recent-activity', isAnalyst, asyncHandler(dashboardRecentActivity));

export default router;
