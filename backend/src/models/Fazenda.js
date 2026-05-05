import mongoose from 'mongoose';

const fazendaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true
    },
    apelido: {
        type: String,
        trim: true
    },
    municipio: String,
    estado: String,
    area_total_ha: Number,
    coordenadas: {
        lat: Number,
        lng: Number
    },
    car: String,
    ccir: String,
    itr: String,
    responsavel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    ativa: {
        type: Boolean,
        default: true
    },
    observacoes: String
}, {
    timestamps: true
});

const Fazenda = mongoose.model('Fazenda', fazendaSchema);

export default Fazenda;
