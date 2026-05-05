import mongoose from 'mongoose';

const slaughterVersionSchema = new mongoose.Schema({
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    resourceType: {
        type: String,
        enum: ['SlaughterSchedule', 'SlaughterLot'],
        required: true
    },
    version: {
        type: Number,
        required: true
    },
    data: {
        type: Object,
        required: true
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    changeReason: String,
    metadata: {
        ip: String,
        userAgent: String
    }
}, {
    timestamps: true
});

// Índice composto para busca rápida de versões de um recurso
slaughterVersionSchema.index({ resourceId: 1, version: -1 });

const SlaughterVersion = mongoose.model('SlaughterVersion', slaughterVersionSchema);

export default SlaughterVersion;
