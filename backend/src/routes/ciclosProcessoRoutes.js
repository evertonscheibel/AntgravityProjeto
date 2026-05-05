import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getProcessosDashboard,
    getCiclosProcesso,
    createCicloProcesso,
    getRendimentoEquipe
} from '../controllers/cicloProcessoController.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getProcessosDashboard);
router.get('/rendimento-equipe', getRendimentoEquipe);

router.route('/')
    .get(getCiclosProcesso)
    .post(authorize('admin', 'manager'), createCicloProcesso);

export default router;
