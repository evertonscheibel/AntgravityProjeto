import Fornecedor from '../models/Fornecedor.js';
import AvaliacaoFornecedor from '../models/AvaliacaoFornecedor.js';

// @desc    Listar fornecedores
export const getFornecedores = async (req, res) => {
    try {
        const { categoria, status, estado, search } = req.query;
        let query = { company: req.user.company };

        if (categoria) query.categorias = categoria;
        if (status) query.status = status;
        if (estado) query['endereco.estado'] = estado;
        if (search) {
            query.$or = [
                { razao_social: { $regex: search, $options: 'i' } },
                { nome_fantasia: { $regex: search, $options: 'i' } },
                { cnpj_cpf: { $regex: search, $options: 'i' } }
            ];
        }

        const fornecedores = await Fornecedor.find(query).sort({ razao_social: 1 });
        res.json({ success: true, data: fornecedores });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Criar fornecedor
export const createFornecedor = async (req, res) => {
    try {
        const fornecedor = await Fornecedor.create({
            ...req.body,
            company: req.user.company,
            criado_por: req.user._id
        });
        res.status(201).json({ success: true, data: fornecedor });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Obter detalhe do fornecedor
export const getFornecedorById = async (req, res) => {
    try {
        const fornecedor = await Fornecedor.findOne({ _id: req.params.id, company: req.user.company });
        if (!fornecedor) return res.status(404).json({ success: false, message: 'Fornecedor não encontrado' });
        res.json({ success: true, data: fornecedor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Atualizar fornecedor
export const updateFornecedor = async (req, res) => {
    try {
        const fornecedor = await Fornecedor.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company },
            req.body,
            { new: true, runValidators: true }
        );
        if (!fornecedor) return res.status(404).json({ success: false, message: 'Fornecedor não encontrado' });
        res.json({ success: true, data: fornecedor });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Alterar status do fornecedor
export const updateFornecedorStatus = async (req, res) => {
    try {
        const { status, motivo_bloqueio } = req.body;
        const fornecedor = await Fornecedor.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company },
            { status, motivo_bloqueio },
            { new: true }
        );
        if (!fornecedor) return res.status(404).json({ success: false, message: 'Fornecedor não encontrado' });
        res.json({ success: true, data: fornecedor });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Registrar avaliação
export const createAvaliacao = async (req, res) => {
    try {
        const avaliacao = await AvaliacaoFornecedor.create({
            ...req.body,
            fornecedor_id: req.params.id,
            avaliador_id: req.user._id,
            company: req.user.company
        });
        res.status(201).json({ success: true, data: avaliacao });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Listar avaliações de um fornecedor
export const getAvaliacoes = async (req, res) => {
    try {
        const avaliacoes = await AvaliacaoFornecedor.find({
            fornecedor_id: req.params.id,
            company: req.user.company
        }).populate('avaliador_id', 'name').sort({ data: -1 });
        res.json({ success: true, data: avaliacoes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Ranking de fornecedores por categoria
export const getRankingPorCategoria = async (req, res) => {
    try {
        const { categoria } = req.query;
        let query = { company: req.user.company, status: 'ativo' };
        if (categoria) query.categorias = categoria;

        const ranking = await Fornecedor.find(query)
            .sort({ 'avaliacao.nota_geral': -1 })
            .limit(10);

        res.json({ success: true, data: ranking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
