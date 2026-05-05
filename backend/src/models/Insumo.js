import mongoose from 'mongoose';

const insumoSchema = new mongoose.Schema({
    fazenda_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fazenda',
        required: true
    },
    nome: {
        type: String,
        required: true,
        trim: true
    },
    marca: String,
    tipo: {
        type: String,
        enum: [
            'defensivo_herbicida',
            'defensivo_inseticida',
            'defensivo_fungicida',
            'fertilizante_foliar',
            'fertilizante_solo',
            'semente',
            'combustivel',
            'lubrificante',
            'outro'
        ],
        required: true
    },
    unidade: {
        type: String,
        required: true
    },
    quantidade_atual: {
        type: Number,
        default: 0
    },
    quantidade_minima: {
        type: Number,
        default: 0
    },
    custo_unitario: Number,
    data_validade: Date,
    local_armazenamento: String,
    numero_registro_mapa: String,
    classe_toxicologica: String,
    fotos: [String],
    ativo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Insumo = mongoose.model('Insumo', insumoSchema);

export default Insumo;
