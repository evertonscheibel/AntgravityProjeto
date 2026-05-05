import express from 'express';
import { getManejos, createManejo, getRastreabilidade } from '../controllers/manejoController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getManejos)
    .post(authorize('admin', 'agronomo', 'coordenador'), createManejo);

router.get('/rastreabilidade/:talhao_id', getRastreabilidade);

export default router;
