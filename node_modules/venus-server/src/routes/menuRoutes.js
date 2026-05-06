import express from 'express';
import { getLunchOfTheDay, getMenuItems } from '../controllers/menuController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(getMenuItems));
router.get('/lunch-of-the-day', asyncHandler(getLunchOfTheDay));

export default router;
