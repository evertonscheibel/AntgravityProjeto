import express from 'express';
import {
    getAssets,
    getAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    getAssetWithDetails,
    getAssetReport,
    importAssets,
    exportAssets,
    toggleActiveStatus
} from '../controllers/assetController.js';
import { protect, authorize } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Garantir que o diretório uploads existe
const uploadsDir = 'uploads/';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do Multer para upload temporário
const upload = multer({
    dest: uploadsDir,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel') || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos Excel são permitidos'));
        }
    }
});

router.route('/')
    .get(protect, getAssets)
    .post(protect, authorize('admin', 'tecnico', 'agronomo'), createAsset);

router.get('/reports/analytics', protect, authorize('admin', 'tecnico', 'agronomo'), getAssetReport);

router.post('/import', protect, authorize('admin'), upload.single('file'), importAssets);
router.get('/export', protect, authorize('admin', 'tecnico', 'agronomo'), exportAssets);

router.route('/:id')
    .get(protect, getAsset)
    .put(protect, authorize('admin', 'tecnico', 'agronomo'), updateAsset)
    .delete(protect, authorize('admin'), deleteAsset);

router.patch('/:id/toggle-active', protect, authorize('admin', 'tecnico', 'agronomo'), toggleActiveStatus);

router.get('/:id/details', protect, authorize('admin', 'tecnico', 'agronomo'), getAssetWithDetails);


export default router;
