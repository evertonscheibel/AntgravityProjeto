import Manejo from '../models/Manejo.js';
import Insumo from '../models/Insumo.js';
import MovimentacaoInsumo from '../models/MovimentacaoInsumo.js';

// @desc    Listar manejos
// @route   GET /api/manejos
// @access  Private
export const getManejos = async (req, res, next) => {
    try {
        const { fazenda_id, safra_id, talhao_id } = req.query;
        let query = {};

        if (fazenda_id) query.fazenda_id = fazenda_id;
        if (safra_id) query.safra_id = safra_id;
        if (talhao_id) query.talhao_id = talhao_id;

        const manejos = await Manejo.find(query)
            .populate('responsavel_id', 'name')
            .populate('safra_id', 'nome cultura')
            .populate('talhao_id', 'nome');

        res.json({
            success: true,
            count: manejos.length,
            data: manejos
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Criar manejo
// @route   POST /api/manejos
// @access  Private
export const createManejo = async (req, res, next) => {
    try {
        const manejo = await Manejo.create(req.body);

        res.status(201).json({
            success: true,
            data: manejo
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obter rastreabilidade por talhão
// @route   GET /api/manejos/rastreabilidade/:talhao_id
// @access  Private
export const getRastreabilidade = async (req, res, next) => {
    try {
        const manejos = await Manejo.find({ talhao_id: req.params.talhao_id })
            .sort({ data_execucao: -1 })
            .populate('responsavel_id', 'name')
            .populate('safra_id', 'nome cultura');

        res.json({
            success: true,
            data: manejos
        });
    } catch (error) {
        next(error);
    }
};
