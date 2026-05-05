import Safra from '../models/Safra.js';

// @desc    Listar safras
// @route   GET /api/safras
// @access  Private
export const getSafras = async (req, res, next) => {
    try {
        const { fazenda_id } = req.query;
        let query = {};

        if (fazenda_id) {
            query.fazenda_id = fazenda_id;
        } else if (req.user.role !== 'admin') {
            query.fazenda_id = { $in: req.user.fazendas_acesso };
        }

        const safras = await Safra.find(query).populate('responsavel_agronomo', 'name');

        res.json({
            success: true,
            count: safras.length,
            data: safras
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Criar safra
// @route   POST /api/safras
// @access  Private
export const createSafra = async (req, res, next) => {
    try {
        const safra = await Safra.create(req.body);

        res.status(201).json({
            success: true,
            data: safra
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obter detalhes da safra
// @route   GET /api/safras/:id
// @access  Private
export const getSafra = async (req, res, next) => {
    try {
        const safra = await Safra.findById(req.params.id)
            .populate('responsavel_agronomo', 'name email')
            .populate('talhoes.talhao_id');

        if (!safra) {
            return res.status(404).json({
                success: false,
                message: 'Safra não encontrada'
            });
        }

        res.json({
            success: true,
            data: safra
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Atualizar safra
// @route   PUT /api/safras/:id
// @access  Private
export const updateSafra = async (req, res, next) => {
    try {
        const safra = await Safra.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!safra) {
            return res.status(404).json({
                success: false,
                message: 'Safra não encontrada'
            });
        }

        res.json({
            success: true,
            data: safra
        });
    } catch (error) {
        next(error);
    }
};
