import mongoose from 'mongoose';

const centroCustoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome do centro de custo é obrigatório'],
        trim: true
    },
    tipo: {
        type: String,
        enum: ['safra', 'fazenda', 'talhao', 'projeto'],
        required: true
    },
    fazenda_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fazenda',
        required: true
    },
    safra_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Safra'
    },
    talhao_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Talhao'
    },
    orcamento_total: {
        type: Number,
        default: 0
    },
    custo_realizado: {
        type: Number,
        default: 0
    },
    ativo: {
        type: Boolean,
        default: true
    },
    responsavel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    company: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const CentroCusto = mongoose.model('CentroCusto', centroCustoSchema);

export default CentroCusto;
