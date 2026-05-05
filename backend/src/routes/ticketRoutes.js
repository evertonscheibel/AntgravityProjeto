import express from 'express';
import {
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    addComment,
    getTicketStats,
    createPublicTicket
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rota pública (sem autenticação)
router.post('/public', createPublicTicket);

router.route('/')
    .get(protect, getTickets)
    .post(protect, createTicket);

router.get('/stats/summary', protect, authorize('admin', 'tecnico'), getTicketStats);

router.route('/:id')
    .get(protect, getTicket)
    .put(protect, authorize('admin', 'tecnico'), updateTicket)
    .delete(protect, authorize('admin'), deleteTicket);

router.post('/:id/comments', protect, addComment);

export default router;
