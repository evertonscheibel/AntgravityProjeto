import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true
    },
    fazenda_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fazenda'
    },
    type: {
        type: String,
        enum: ['ssl', 'licenca_software', 'validacao_hardware', 'car', 'ccir', 'itr', 'outorga', 'ambiental'],
        required: true
    },
    issueDate: {
        type: Date,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    },
    provider: {
        type: String,
        trim: true
    },
    filePath: String,
    status: {
        type: String,
        enum: ['ativo', 'expirado', 'renovado'],
        default: 'ativo'
    },
    notes: String,
    notificationsSent: {
        days30: { type: Boolean, default: false },
        days15: { type: Boolean, default: false },
        days7: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

// Índice para buscar certificados próximos do vencimento
certificateSchema.index({ expirationDate: 1 });
certificateSchema.index({ status: 1 });

// Virtual para dias até expiração
certificateSchema.virtual('daysUntilExpiration').get(function () {
    const diff = this.expirationDate - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
