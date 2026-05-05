import Insumo from '../models/Insumo.js';
import MovimentacaoInsumo from '../models/MovimentacaoInsumo.js';

// @desc    Listar insumos
// @route   GET /api/insumos
// @access  Private
export const getInsumos = async (req, res, next) => {
    try {
        const { fazenda_id } = req.query;
        let query = {};

        if (fazenda_id) {
            query.fazenda_id = fazenda_id;
        }

        const insumos = await Insumo.find(query);

        res.json({
            success: true,
            count: insumos.length,
            data: insumos
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Criar insumo
// @route   POST /api/insumos
// @access  Private
export const createInsumo = async (req, res, next) => {
    try {
        const insumo = await Insumo.create(req.body);

        res.status(201).json({
            success: true,
            data: insumo
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Registrar movimentação de insumo
// @route   POST /api/insumos/:id/movimentacao
// @access  Private
export const registerMovimentacao = async (req, res, next) => {
    try {
        const { tipo, quantidade, custo_total, observacao, manejo_id, talhao_id, safra_id } = req.body;
        const insumo = await Insumo.findById(req.params.id);

        if (!insumo) {
            return res.status(404).json({ success: false, message: 'Insumo não encontrado' });
        }

        // Criar registro de movimentação
        const movimentacao = await MovimentacaoInsumo.create({
            fazenda_id: insumo.fazenda_id,
            insumo_id: insumo._id,
            tipo,
            quantidade,
            custo_total,
            manejo_id,
            talhao_id,
            safra_id,
            responsavel_id: req.user._id,
            observacao
        });

        // Atualizar saldo do insumo
        if (tipo === 'entrada') {
            insumo.quantidade_atual += Number(quantidade);
        } else if (tipo === 'saida') {
            insumo.quantidade_atual -= Number(quantidade);
        } else if (tipo === 'ajuste') {
            insumo.quantidade_atual = Number(quantidade);
        }

        await insumo.save();

        res.status(201).json({
            success: true,
            data: movimentacao
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Kardex (extrato de movimentações)
// @route   GET /api/insumos/:id/kardex
// @access  Private
export const getKardex = async (req, res, next) => {
    try {
        const movimentacoes = await MovimentacaoInsumo.find({ insumo_id: req.params.id })
            .sort({ data: -1 })
            .populate('responsavel_id', 'name')
            .populate('manejo_id', 'tipo descricao');

        res.json({
            success: true,
            data: movimentacoes
        });
    } catch (error) {
        next(error);
    }
};
