import mongoose from 'mongoose';

const vacancySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Título da vaga é obrigatório'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Descrição da vaga é obrigatória']
    },
    requirements: {
        type: String
    },
    sector: {
        type: String,
        required: [true, 'Setor é obrigatório']
    },
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED', 'ARCHIVED'],
        default: 'OPEN'
    },
    company: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Vacancy = mongoose.model('Vacancy', vacancySchema);

export default Vacancy;
