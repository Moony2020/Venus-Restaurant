import express from 'express';
import { getIncidents, getIncidentStats } from '../controllers/incidentController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, requireRole('admin'), getIncidents);
router.get('/stats', verifyToken, requireRole('admin'), getIncidentStats);

export default router;
