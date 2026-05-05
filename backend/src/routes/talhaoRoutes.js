import express from 'express';
import { getTalhoes, createTalhao, getTalhao, updateTalhao } from '../controllers/talhaoController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getTalhoes)
    .post(authorize('admin', 'coordenador', 'agronomo'), createTalhao);

router.route('/:id')
    .get(getTalhao)
    .put(authorize('admin', 'coordenador', 'agronomo'), updateTalhao);

export default router;
