import mongoose from 'mongoose';
import softDeletePlugin from '../utils/softDeletePlugin.js';

const slaughterScheduleSchema = new mongoose.Schema({
    slaughterDate: {
        type: Date,
        required: true,
        unique: true,
        index: true
    },
    startTime: {
        type: String,
        required: [true, 'Horário de início é obrigatório'],
        default: '07:00'
    },
    rateHeadsPerHour: {
        type: Number,
        default: 100
    },
    status: {
        type: String,
        enum: ['DRAFT', 'CLOSED'],
        default: 'DRAFT'
    },
    totalBoi: { type: Number, default: 0 },
    totalVaca: { type: Number, default: 0 },
    totalNovilha: { type: Number, default: 0 },
    totalBubalino: { type: Number, default: 0 },
    totalTouro: { type: Number, default: 0 },
    totalCattle: { type: Number, default: 0 },
    breakfastTime: { type: String, default: '08:00' },
    breakfastDuration: { type: Number, default: 15 },
    lunchTime: { type: String, default: '11:00' },
    lunchDuration: { type: Number, default: 70 },
    pdfUrl: String,
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    closedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    closedAt: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual para popular os lotes em ordem
slaughterScheduleSchema.virtual('lots', {
    ref: 'SlaughterLot',
    localField: '_id',
    foreignField: 'schedule',
    options: { sort: { order: 1 } }
});

slaughterScheduleSchema.plugin(softDeletePlugin);

const SlaughterSchedule = mongoose.model('SlaughterSchedule', slaughterScheduleSchema);

export default SlaughterSchedule;
