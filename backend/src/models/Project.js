import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome do projeto é obrigatório'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['PLANNING', 'ACTIVE', 'HOLD', 'COMPLETED', 'ARCHIVED'],
        default: 'PLANNING'
    },
    repositoryUrl: {
        type: String,
        trim: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: Date,
    methodology: {
        type: String,
        enum: ['KANBAN', 'SCRUM'],
        default: 'KANBAN'
    }
}, {
    timestamps: true
});

// Índices
projectSchema.index({ manager: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ members: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
