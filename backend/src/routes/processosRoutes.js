import express from 'express';
import {
    getCycles,
    getActiveCycle,
    createCycle,
    closeCycle,
    getProcesses,
    createProcess,
    deliverProcess,
    deleteProcess,
    getReports
} from '../controllers/processosController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/ciclos', getCycles);
router.get('/ciclos/atual', getActiveCycle);
router.post('/ciclos', createCycle);
router.put('/ciclos/:id/fechar', closeCycle);

router.get('/', getProcesses);
router.post('/', createProcess);
router.put('/:id/entregar', deliverProcess);
router.delete('/:id', deleteProcess);

router.get('/relatorios', getReports);

export default router;
