import Talhao from '../models/Talhao.js';

// @desc    Listar talhões
// @route   GET /api/talhoes
// @access  Private
export const getTalhoes = async (req, res, next) => {
    try {
        const { fazenda_id } = req.query;
        let query = {};

        if (fazenda_id) {
            query.fazenda_id = fazenda_id;
        }

        const talhoes = await Talhao.find(query);

        res.json({
            success: true,
            count: talhoes.length,
            data: talhoes
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Criar talhão
// @route   POST /api/talhoes
// @access  Private
export const createTalhao = async (req, res, next) => {
    try {
        const talhao = await Talhao.create(req.body);

        res.status(201).json({
            success: true,
            data: talhao
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obter detalhes do talhão
// @route   GET /api/talhoes/:id
// @access  Private
export const getTalhao = async (req, res, next) => {
    try {
        const talhao = await Talhao.findById(req.params.id);

        if (!talhao) {
            return res.status(404).json({
                success: false,
                message: 'Talhão não encontrado'
            });
        }

        res.json({
            success: true,
            data: talhao
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Atualizar talhão
// @route   PUT /api/talhoes/:id
// @access  Private
export const updateTalhao = async (req, res, next) => {
    try {
        const talhao = await Talhao.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!talhao) {
            return res.status(404).json({
                success: false,
                message: 'Talhão não encontrado'
            });
        }

        res.json({
            success: true,
            data: talhao
        });
    } catch (error) {
        next(error);
    }
};
