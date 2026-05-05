import express from 'express';
import { getInsumos, createInsumo, registerMovimentacao, getKardex } from '../controllers/insumoController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getInsumos)
    .post(authorize('admin', 'financeiro'), createInsumo);

router.post('/:id/movimentacao', authorize('admin', 'financeiro', 'coordenador'), registerMovimentacao);
router.get('/:id/kardex', getKardex);

export default router;
