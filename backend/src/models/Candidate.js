import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome do candidato é obrigatório'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email do candidato é obrigatório'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String
    },
    resumeUrl: {
        type: String
    },
    vacancy: {
        type: mongoose.Schema.ObjectId,
        ref: 'Vacancy',
        required: true
    },
    status: {
        type: String,
        enum: ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'HIRED'],
        default: 'APPLIED'
    },
    notes: {
        type: String
    },
    company: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;
