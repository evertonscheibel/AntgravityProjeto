import LancamentoCusto from '../models/LancamentoCusto.js';
import CentroCusto from '../models/CentroCusto.js';
import OrcamentoSafra from '../models/OrcamentoSafra.js';

// @desc    Obter dashboard de custos
export const getCustosDashboard = async (req, res) => {
    try {
        const { fazenda_id, safra_id } = req.query;
        let query = { company: req.user.company };
        if (fazenda_id) query.fazenda_id = fazenda_id;
        if (safra_id) query.safra_id = safra_id;

        const [totalCusto, porCategoria, porTalhao] = await Promise.all([
            LancamentoCusto.aggregate([
                { $match: query },
                { $group: { _id: null, total: { $sum: '$valor' } } }
            ]),
            LancamentoCusto.aggregate([
                { $match: query },
                { $group: { _id: '$categoria', total: { $sum: '$valor' } } },
                { $sort: { total: -1 } }
            ]),
            LancamentoCusto.aggregate([
                { $match: query },
                { $group: { _id: '$talhao_id', total: { $sum: '$valor' } } },
                { $lookup: { from: 'talhoes', localField: '_id', foreignField: '_id', as: 'talhao' } },
                { $unwind: { path: '$talhao', preserveNullAndEmptyArrays: true } },
                { $sort: { total: -1 } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                custoTotal: totalCusto[0]?.total || 0,
                custoPorCategoria: porCategoria,
                custoPorTalhao: porTalhao
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Listar lançamentos de custo
export const getLancamentosCusto = async (req, res) => {
    try {
        const { fazenda_id, safra_id, categoria } = req.query;
        let query = { company: req.user.company };

        if (fazenda_id) query.fazenda_id = fazenda_id;
        if (safra_id) query.safra_id = safra_id;
        if (categoria) query.categoria = categoria;

        const lancamentos = await LancamentoCusto.find(query)
            .populate('centro_custo_id', 'nome')
            .populate('fornecedor_id', 'nome_fantasia razao_social')
            .sort({ data: -1 });

        res.json({ success: true, data: lancamentos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Criar lançamento de custo
export const createLancamentoCusto = async (req, res) => {
    try {
        const lancamento = await LancamentoCusto.create({
            ...req.body,
            company: req.user.company,
            criado_por: req.user._id
        });
        res.status(201).json({ success: true, data: lancamento });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Obter orçamento de safra
export const getOrcamentoSafra = async (req, res) => {
    try {
        const orcamento = await OrcamentoSafra.findOne({
            safra_id: req.params.safra_id,
            company: req.user.company
        });
        if (!orcamento) return res.status(404).json({ success: false, message: 'Orçamento não encontrado' });
        res.json({ success: true, data: orcamento });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
