import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getVacancies, createVacancy, updateVacancy, deleteVacancy,
    getCandidates, createCandidate, updateCandidate, deleteCandidate
} from '../controllers/atsController.js';

const router = express.Router();

router.use(protect);

// Vacancies
router.route('/vacancies')
    .get(getVacancies)
    .post(authorize('admin', 'manager'), createVacancy);

router.route('/vacancies/:id')
    .put(authorize('admin', 'manager'), updateVacancy)
    .delete(authorize('admin', 'manager'), deleteVacancy);

// Candidates
router.route('/candidates')
    .get(getCandidates)
    .post(createCandidate);

router.route('/candidates/:id')
    .put(authorize('admin', 'manager', 'tecnico'), updateCandidate)
    .delete(authorize('admin', 'manager'), deleteCandidate);

export default router;
