import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as preScheduleController from '../controllers/preScheduleController.js';
import * as slaughterController from '../controllers/slaughterController.js';
import * as closureController from '../controllers/slaughterClosureController.js';

const router = express.Router();

// Middleware de proteção global para este módulo
router.use(protect);

// ── PRÉ-ESCALA ───────────────────────────────────────────────

router.get('/pre-schedule/calendar', preScheduleController.getCalendar);
router.get('/pre-schedule/:date', preScheduleController.getByDate);
router.put('/pre-schedule/:id', authorize('admin', 'tecnico'), preScheduleController.update);
router.post('/pre-schedule/:id/publish', authorize('admin', 'tecnico'), preScheduleController.publish);

// ── ESCALA DE ABATE ──────────────────────────────────────────

router.get('/calendar', slaughterController.getCalendar);
router.get('/schedules/:date', slaughterController.getByDate);
router.put('/schedules/:id', authorize('admin', 'tecnico'), slaughterController.updateSchedule);
router.post('/schedules/:id/lots', authorize('admin', 'tecnico'), slaughterController.addLot);
router.get('/lots/:id/traceability', slaughterController.getSlaughterTraceability);
router.put('/lots/:id', authorize('admin', 'tecnico'), slaughterController.updateLot);
router.delete('/lots/:id', authorize('admin', 'tecnico'), slaughterController.deleteLot);
router.post('/schedules/:id/reorder', authorize('admin', 'tecnico'), slaughterController.reorderLots);
router.post('/schedules/:id/reopen', authorize('admin'), slaughterController.reopenSchedule);
router.post('/schedules/:id/recalculate', authorize('admin', 'tecnico'), slaughterController.recalculateLots);
router.post('/schedules/:id/close', authorize('admin', 'tecnico'), slaughterController.closeSchedule);

// ── FECHAMENTO SIF ───────────────────────────────────────────

router.get('/closure/:date', closureController.getByDate);
router.post('/closure/:date/from-pre', authorize('admin', 'tecnico'), closureController.createFromSchedule);
router.put('/closure/:id', authorize('admin', 'tecnico'), closureController.update);
router.post('/closure/:id/reorder', authorize('admin', 'tecnico'), closureController.reorderLines);
router.post('/closure/:id/close', authorize('admin', 'tecnico'), closureController.closeClosure);
router.post('/closure/:id/reopen', authorize('admin'), closureController.reopenClosure);
router.get('/closure/:id/pdf', closureController.exportPdf);
router.get('/closure/:id/export', closureController.exportXlsm);

export default router;
