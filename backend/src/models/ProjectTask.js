import mongoose from 'mongoose';

const projectTaskSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Título da tarefa é obrigatório'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectColumn',
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    linkedTicket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    },
    storyPoints: {
        type: Number,
        min: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    dueDate: Date
}, {
    timestamps: true
});

// Índices
projectTaskSchema.index({ project: 1 });
projectTaskSchema.index({ assignedTo: 1 });
projectTaskSchema.index({ status: 1 });
projectTaskSchema.index({ linkedTicket: 1 });

const ProjectTask = mongoose.model('ProjectTask', projectTaskSchema);

export default ProjectTask;
