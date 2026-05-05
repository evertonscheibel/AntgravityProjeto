import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getBurnDown,
    getLeadTime,
    getEffortDistribution
} from '../controllers/metricsController.js';

const router = express.Router();

router.get('/burn-down', protect, getBurnDown);
router.get('/lead-time', protect, getLeadTime);
router.get('/effort', protect, getEffortDistribution);



export default router;
