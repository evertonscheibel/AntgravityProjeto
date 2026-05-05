import mongoose from 'mongoose';

const movimentacaoInsumoSchema = new mongoose.Schema({
    fazenda_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fazenda',
        required: true
    },
    insumo_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Insumo',
        required: true
    },
    tipo: {
        type: String,
        enum: ['entrada', 'saida', 'ajuste'],
        required: true
    },
    quantidade: {
        type: Number,
        required: true
    },
    custo_total: Number,

    // Para saída
    manejo_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manejo'
    },
    talhao_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Talhao'
    },
    safra_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Safra'
    },

    // Para entrada
    nota_fiscal: String,
    fornecedor: String,

    responsavel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    data: {
        type: Date,
        default: Date.now
    },
    observacao: String
}, {
    timestamps: true
});

const MovimentacaoInsumo = mongoose.model('MovimentacaoInsumo', movimentacaoInsumoSchema);

export default MovimentacaoInsumo;
