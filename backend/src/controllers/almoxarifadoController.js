import Product from '../models/Product.js';
import Movement from '../models/Movement.js';

// ============ Products ============
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ company: req.user.company || 'default' }).sort({ name: 1 });
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const product = await Product.create({
            ...req.body,
            company: req.user.company || 'default'
        });
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ success: false, message: 'Produto não encontrado' });
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Produto não encontrado' });
        await Movement.deleteMany({ product: req.params.id });
        res.json({ success: true, message: 'Produto e histórico de movimentações excluídos' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============ Movements ============
export const getMovements = async (req, res) => {
    try {
        const { productId } = req.query;
        const query = { company: req.user.company || 'default' };
        if (productId) query.product = productId;

        const movements = await Movement.find(query)
            .populate('product', 'name unit')
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: movements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createMovement = async (req, res) => {
    try {
        const { productId, type, quantity, reason } = req.body;
        const product = await Product.findById(productId);

        if (!product) return res.status(404).json({ success: false, message: 'Produto não encontrado' });

        // Update product quantity
        if (type === 'IN') {
            product.quantity += Number(quantity);
        } else if (type === 'OUT') {
            if (product.quantity < quantity) {
                return res.status(400).json({ success: false, message: 'Estoque insuficiente' });
            }
            product.quantity -= Number(quantity);
        }

        const movement = await Movement.create({
            product: productId,
            type,
            quantity,
            reason,
            user: req.user._id,
            company: req.user.company || 'default'
        });

        await product.save();

        res.status(201).json({ success: true, data: movement });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
