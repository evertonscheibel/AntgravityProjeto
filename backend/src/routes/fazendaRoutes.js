import express from 'express';
import { getFazendas, createFazenda, getFazenda, updateFazenda } from '../controllers/fazendaController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getFazendas)
    .post(authorize('admin'), createFazenda);

router.route('/:id')
    .get(getFazenda)
    .put(authorize('admin', 'coordenador'), updateFazenda);

export default router;
