import mongoose from 'mongoose';

const safraSchema = new mongoose.Schema({
    fazenda_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fazenda',
        required: true
    },
    nome: {
        type: String,
        required: [true, 'Nome da safra é obrigatório'],
        trim: true
    },
    cultura: {
        type: String,
        required: true
    },
    variedade: String,
    ciclo_dias: Number,

    talhoes: [{
        talhao_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Talhao'
        },
        area_plantada_ha: Number,
        data_plantio: Date,
        data_previsao_colheita: Date,
        status: {
            type: String,
            enum: ['planejado', 'plantado', 'em_desenvolvimento', 'colhendo', 'encerrado'],
            default: 'planejado'
        }
    }],

    meta_produtividade_sacas_ha: Number,
    produtividade_realizada_sacas_ha: Number,

    fases: [{
        nome: {
            type: String,
            enum: ['preparo_solo', 'plantio', 'tratos_culturais', 'colheita', 'pos_colheita']
        },
        data_inicio_prevista: Date,
        data_fim_prevista: Date,
        data_inicio_real: Date,
        data_fim_real: Date,
        concluida: {
            type: Boolean,
            default: false
        },
        observacoes: String
    }],

    status_geral: {
        type: String,
        enum: ['planejada', 'em_andamento', 'encerrada'],
        default: 'planejada'
    },
    responsavel_agronomo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    observacoes: String
}, {
    timestamps: true
});

const Safra = mongoose.model('Safra', safraSchema);

export default Safra;
