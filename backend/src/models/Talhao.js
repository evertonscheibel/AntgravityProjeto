import mongoose from 'mongoose';

const talhaoSchema = new mongoose.Schema({
    fazenda_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fazenda',
        required: true
    },
    nome: {
        type: String,
        required: [true, 'Nome do talhão é obrigatório'],
        trim: true
    },
    area_ha: Number,
    tipo_solo: {
        type: String,
        enum: ['argiloso', 'arenoso', 'misto', 'outro']
    },
    topografia: {
        type: String,
        enum: ['plano', 'ondulado', 'acidentado']
    },
    irrigacao: {
        type: Boolean,
        default: false
    },
    tipo_irrigacao: String,
    cultura_atual: String,
    historico_culturas: [{
        cultura: String,
        safra: String,
        produtividade_sacas_ha: Number,
        data: Date
    }],
    coordenadas_poligono: [[Number]],
    ativo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Talhao = mongoose.model('Talhao', talhaoSchema);

export default Talhao;
