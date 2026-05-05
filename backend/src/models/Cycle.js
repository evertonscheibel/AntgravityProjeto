import mongoose from 'mongoose';

const cycleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome do ciclo é obrigatório'],
        trim: true
    },
    startDate: {
        type: Date,
        required: [true, 'Data de início é obrigatória']
    },
    endDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'OPEN'
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Cycle = mongoose.model('Cycle', cycleSchema);

export default Cycle;
