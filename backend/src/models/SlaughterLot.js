import mongoose from 'mongoose';
import softDeletePlugin from '../utils/softDeletePlugin.js';

const slaughterLotSchema = new mongoose.Schema({
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SlaughterSchedule',
        required: true,
        index: true
    },
    lotNumber: {
        type: Number,
        required: true
    },
    rancher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rancher'
    },
    fazenda: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fazenda',
        required: [true, 'Fazenda de origem é obrigatória']
    },
    rancherName: {
        type: String,
        required: [true, 'Nome do pecuarista é obrigatório']
    },
    brokerNumber: {
        type: String,
        required: [true, 'Código do corretor é obrigatório']
    },
    boi: { type: Number, default: 0 },
    vaca: { type: Number, default: 0 },
    novilha: { type: Number, default: 0 },
    bubalino: { type: Number, default: 0 },
    touro: { type: Number, default: 0 },
    total: {
        type: Number,
        required: true
    },
    startTime: String,
    durationMinutes: Number,
    endTime: String,
    order: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Índice composto único para evitar duplicatas de número de lote na mesma escala
slaughterLotSchema.index({ schedule: 1, lotNumber: 1 }, { unique: true });

slaughterLotSchema.plugin(softDeletePlugin);

const SlaughterLot = mongoose.model('SlaughterLot', slaughterLotSchema);

export default SlaughterLot;
