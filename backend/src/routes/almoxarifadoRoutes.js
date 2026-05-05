import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getProducts, createProduct, updateProduct, deleteProduct,
    getMovements, createMovement
} from '../controllers/almoxarifadoController.js';

const router = express.Router();

router.use(protect);

// Products
router.route('/products')
    .get(getProducts)
    .post(authorize('admin', 'manager', 'tecnico'), createProduct);

router.route('/products/:id')
    .put(authorize('admin', 'manager', 'tecnico'), updateProduct)
    .delete(authorize('admin', 'manager'), deleteProduct);

// Movements
router.route('/movements')
    .get(getMovements)
    .post(authorize('admin', 'manager', 'tecnico'), createMovement);

export default router;
