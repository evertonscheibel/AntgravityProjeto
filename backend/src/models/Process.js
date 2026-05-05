import mongoose from 'mongoose';

const processSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Título do processo é obrigatório'],
        trim: true
    },
    description: {
        type: String
    },
    sector: {
        type: String,
        required: [true, 'Setor é obrigatório']
    },
    category: {
        type: String,
        required: [true, 'Categoria é obrigatória'],
        default: 'Operacional'
    },
    responsible: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Responsável é obrigatório']
    },
    cycle: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cycle',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'OVERDUE'],
        default: 'PENDING'
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    deadline: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date
    },
    score: {
        type: Number,
        min: 0,
        max: 10
    },
    feedback: {
        type: String
    },
    company: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Process = mongoose.model('Process', processSchema);

export default Process;
