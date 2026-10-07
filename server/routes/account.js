import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import {
  getMyProfile,
  updateMyProfile,
  changeMyEmail,
  changeMyPassword,
  updateMyPreferences,
  updateTeamSettings,
} from '../controllers/accountController.js';

const router = express.Router();
router.use(authenticate);

router.get('/me', asyncHandler(getMyProfile));
router.put('/me', asyncHandler(updateMyProfile));
router.put('/me/email', asyncHandler(changeMyEmail));
router.put('/me/password', asyncHandler(changeMyPassword));
router.put('/me/preferences', asyncHandler(updateMyPreferences));
router.put('/me/team-settings', asyncHandler(updateTeamSettings));

export default router;
