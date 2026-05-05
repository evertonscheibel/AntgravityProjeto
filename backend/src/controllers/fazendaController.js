import Fazenda from '../models/Fazenda.js';

// @desc    Listar fazendas
// @route   GET /api/fazendas
// @access  Private
export const getFazendas = async (req, res, next) => {
    try {
        let query = {};

        // Se não for admin, filtrar pelas fazendas que o usuário tem acesso
        if (req.user.role !== 'admin') {
            query = { _id: { $in: req.user.fazendas_acesso } };
        }

        const fazendas = await Fazenda.find(query).populate('responsavel_id', 'name email');

        res.json({
            success: true,
            count: fazendas.length,
            data: fazendas
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Criar fazenda
// @route   POST /api/fazendas
// @access  Private (Admin)
export const createFazenda = async (req, res, next) => {
    try {
        const fazenda = await Fazenda.create(req.body);

        res.status(201).json({
            success: true,
            data: fazenda
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obter detalhes da fazenda
// @route   GET /api/fazendas/:id
// @access  Private
export const getFazenda = async (req, res, next) => {
    try {
        const fazenda = await Fazenda.findById(req.params.id).populate('responsavel_id', 'name email');

        if (!fazenda) {
            return res.status(404).json({
                success: false,
                message: 'Fazenda não encontrada'
            });
        }

        res.json({
            success: true,
            data: fazenda
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Atualizar fazenda
// @route   PUT /api/fazendas/:id
// @access  Private
export const updateFazenda = async (req, res, next) => {
    try {
        const fazenda = await Fazenda.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!fazenda) {
            return res.status(404).json({
                success: false,
                message: 'Fazenda não encontrada'
            });
        }

        res.json({
            success: true,
            data: fazenda
        });
    } catch (error) {
        next(error);
    }
};
