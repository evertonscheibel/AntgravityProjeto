import express from 'express';
import {
    getCertificates,
    getCertificate,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    getExpiringCertificates,
    checkExpiringCertificates
} from '../controllers/certificateController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(protect, getCertificates)
    .post(protect, authorize('admin', 'tecnico'), createCertificate);

router.get('/expiring/soon', protect, authorize('admin', 'tecnico'), getExpiringCertificates);
router.post('/check-expiration', protect, authorize('admin', 'tecnico'), checkExpiringCertificates);

router.route('/:id')
    .get(protect, getCertificate)
    .put(protect, authorize('admin', 'tecnico'), updateCertificate)
    .delete(protect, authorize('admin'), deleteCertificate);

export default router;
