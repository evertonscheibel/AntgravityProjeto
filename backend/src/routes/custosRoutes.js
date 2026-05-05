import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getCustosDashboard,
    getLancamentosCusto,
    createLancamentoCusto,
    getOrcamentoSafra
} from '../controllers/custosController.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getCustosDashboard);
router.route('/')
    .get(getLancamentosCusto)
    .post(authorize('admin', 'manager'), createLancamentoCusto);

router.get('/orcamento/:safra_id', getOrcamentoSafra);

export default router;
