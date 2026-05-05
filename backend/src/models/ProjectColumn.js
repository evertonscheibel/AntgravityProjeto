import mongoose from 'mongoose';

const projectColumnSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    limit: {
        type: Number, // WIP Limit
        default: 0 // 0 = sem limite
    },
    isDefault: { // Para indicar colunas padrão do sistema se necessário
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Índice composto para garantir ordem única por projeto (opcional, mas boa prática)
projectColumnSchema.index({ project: 1, order: 1 });

const ProjectColumn = mongoose.model('ProjectColumn', projectColumnSchema);

export default ProjectColumn;
