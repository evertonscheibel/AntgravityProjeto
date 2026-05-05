import mongoose from 'mongoose';
import softDeletePlugin from '../utils/softDeletePlugin.js';

const preScheduleLotSchema = new mongoose.Schema({
    preLotRefId: {
        type: String,
        required: true
    },
    producerName: {
        type: String,
        required: [true, 'Nome do produtor é obrigatório']
    },
    municipio: String,
    uf: {
        type: String,
        uppercase: true,
        maxlength: 2
    },
    brokerCode: String,
    brokerName: String,
    boi: { type: Number, default: 0 },
    vaca: { type: Number, default: 0 },
    novilha: { type: Number, default: 0 },
    bubalino: { type: Number, default: 0 },
    touro: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    notes: String
}, { _id: true });

const slaughterPreScheduleSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true,
        index: true
    },
    startTime: {
        type: String,
        default: '07:00'
    },
    rateHeadsPerHour: {
        type: Number,
        default: 100
    },
    status: {
        type: String,
        enum: ['DRAFT', 'ENVIADA', 'PUBLISHED', 'CANCELADA'],
        default: 'DRAFT'
    },
    lots: [preScheduleLotSchema],
    totalCattle: {
        type: Number,
        default: 0
    },
    breakfastTime: { type: String, default: '08:00' },
    breakfastDuration: { type: Number, default: 15 },
    lunchTime: { type: String, default: '11:00' },
    lunchDuration: { type: Number, default: 70 },
    notes: String,
    lastRequestId: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    publishedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    publishedAt: Date,
    version: {
        type: Number,
        default: 1
    },
    history: [{
        version: Number,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        snapshot: Object,
        changeLog: String
    }]
}, {
    timestamps: true
});

// Middleware para calcular totais antes de salvar
slaughterPreScheduleSchema.pre('save', function (next) {
    let totalCattle = 0;
    this.lots.forEach(lot => {
        lot.total = (lot.boi || 0) + (lot.vaca || 0) + (lot.novilha || 0) + (lot.bubalino || 0) + (lot.touro || 0);
        totalCattle += lot.total;
    });
    this.totalCattle = totalCattle;
    next();
});

slaughterPreScheduleSchema.plugin(softDeletePlugin);

const SlaughterPreSchedule = mongoose.model('SlaughterPreSchedule', slaughterPreScheduleSchema);

export default SlaughterPreSchedule;
