import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getFornecedores,
    createFornecedor,
    getFornecedorById,
    updateFornecedor,
    updateFornecedorStatus,
    createAvaliacao,
    getAvaliacoes,
    getRankingPorCategoria
} from '../controllers/fornecedorController.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getFornecedores)
    .post(authorize('admin', 'manager'), createFornecedor);

router.get('/ranking/por-categoria', getRankingPorCategoria);

router.route('/:id')
    .get(getFornecedorById)
    .put(authorize('admin', 'manager'), updateFornecedor);

router.patch('/:id/status', authorize('admin', 'manager'), updateFornecedorStatus);

router.post('/:id/avaliacao', createAvaliacao);
router.get('/:id/avaliacoes', getAvaliacoes);

export default router;
