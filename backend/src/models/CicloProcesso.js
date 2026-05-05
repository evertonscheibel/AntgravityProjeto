import mongoose from 'mongoose';

const etapaCicloSchema = new mongoose.Schema({
    nome: String,
    concluida: { type: Boolean, default: false },
    responsavel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    data_conclusao: Date,
    observacao: String
});

const cicloProcessoSchema = new mongoose.Schema({
    processo_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Process',
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
    numero_ciclo: {
        type: Number,
        required: true
    },
    data_inicio: {
        type: Date,
        default: Date.now
    },
    data_fim: Date,
    duracao_horas: { type: Number, default: 0 },
    duracao_dias: { type: Number, default: 0 },

    status: {
        type: String,
        enum: ['em_andamento', 'concluido', 'cancelado', 'pausado'],
        default: 'em_andamento'
    },

    responsavel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participantes: [{
        colaborador_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        horas_trabalhadas: Number,
        funcao_no_ciclo: String
    }],

    resultado: {
        type: String,
        enum: ['conforme', 'nao_conforme', 'parcial'],
        default: 'conforme'
    },
    percentual_conclusao: { type: Number, default: 0, min: 0, max: 100 },

    etapas: [etapaCicloSchema],

    custo_realizado: { type: Number, default: 0 },
    custo_previsto: { type: Number, default: 0 },

    retrabalho: { type: Boolean, default: false },
    motivo_retrabalho: String,

    observacoes: String,
    avaliacao_coordenador: { type: Number, min: 1, max: 5 },

    company: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Middleware pre-save para calcular duração
cicloProcessoSchema.pre('save', function (next) {
    if (this.data_fim && this.data_inicio) {
        const diffMs = this.data_fim.getTime() - this.data_inicio.getTime();
        this.duracao_horas = diffMs / (1000 * 60 * 60);
        this.duracao_dias = diffMs / (1000 * 60 * 60 * 24);
    }
    next();
});

const CicloProcesso = mongoose.model('CicloProcesso', cicloProcessoSchema);

export default CicloProcesso;
