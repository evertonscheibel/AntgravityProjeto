import mongoose from 'mongoose';

const manejoSchema = new mongoose.Schema({
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

    tipo: {
        type: String,
        enum: [
            'aplicacao_defensivo',
            'adubacao',
            'corretivo_solo',
            'irrigacao',
            'mecanizado',
            'coleta_amostra',
            'outro'
        ],
        required: true
    },

    descricao: String,
    data_execucao: {
        type: Date,
        default: Date.now
    },
    responsavel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Para aplicações de defensivos
    aplicacao: {
        produto: String,
        fabricante: String,
        numero_registro: String,
        dose_ha: Number,
        unidade: String,
        area_aplicada_ha: Number,
        volume_calda_ha: Number,
        alvo: String,
        numero_receituario: String,
        agronomo_responsavel: String,
        intervalo_reentrada_horas: Number,
        intervalo_seguranca_dias: Number,
        equipamento_utilizado: String,
        condicoes_climaticas: {
            temperatura: Number,
            umidade: Number,
            vento_kmh: Number,
            ceu: String
        }
    },

    // Para adubação
    adubacao: {
        produto: String,
        dose_ha: Number,
        area_ha: Number,
        metodo: String
    },

    custo_total: Number,
    observacoes: String,
    fotos: [String]
}, {
    timestamps: true
});

const Manejo = mongoose.model('Manejo', manejoSchema);

export default Manejo;
