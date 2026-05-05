import mongoose from 'mongoose';

const orcamentoSafraSchema = new mongoose.Schema({
    safra_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Safra',
        required: true
    },
    fazenda_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fazenda',
        required: true
    },
    itens: [{
        categoria: String,
        descricao: String,
        valor_previsto: Number,
        valor_realizado: { type: Number, default: 0 },
        variacao_percentual: { type: Number, default: 0 }
    }],
    area_ha: {
        type: Number,
        default: 0
    },
    custo_previsto_total: { type: Number, default: 0 },
    custo_realizado_total: { type: Number, default: 0 },
    custo_previsto_ha: { type: Number, default: 0 },
    custo_realizado_ha: { type: Number, default: 0 },
    receita_prevista: { type: Number, default: 0 },
    receita_realizada: { type: Number, default: 0 },
    lucro_previsto: { type: Number, default: 0 },
    lucro_realizado: { type: Number, default: 0 },
    company: {
        type: String,
        required: true
    },
    criado_em: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const OrcamentoSafra = mongoose.model('OrcamentoSafra', orcamentoSafraSchema);

export default OrcamentoSafra;
