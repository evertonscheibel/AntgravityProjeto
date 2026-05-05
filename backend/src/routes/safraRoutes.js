import express from 'express';
import { getSafras, createSafra, getSafra, updateSafra } from '../controllers/safraController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getSafras)
    .post(authorize('admin', 'agronomo'), createSafra);

router.route('/:id')
    .get(getSafra)
    .put(authorize('admin', 'agronomo'), updateSafra);

export default router;
