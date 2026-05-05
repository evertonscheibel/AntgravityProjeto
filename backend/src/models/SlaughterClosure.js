import mongoose from 'mongoose';

const closureLineSchema = new mongoose.Schema({
    sequence: {
        type: Number,
        required: true
    },
    preLotRefId: {
        type: String,
        required: true
    },
    producerName: {
        type: String,
        required: true
    },
    municipio: String,
    uf: {
        type: String,
        uppercase: true,
        maxlength: 2
    },
    boi: { type: Number, default: 0 },
    vaca: { type: Number, default: 0 },
    novilha: { type: Number, default: 0 },
    bubalino: { type: Number, default: 0 },
    touro: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    brokerCode: String,
    brokerName: String,
    curral: String,
    cor: String,
    nf: String,
    gta: String,
    observations: String
}, { _id: true });

const slaughterClosureSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true,
        index: true
    },
    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SlaughterSchedule'
    },
    status: {
        type: String,
        enum: ['DRAFT', 'CLOSED'],
        default: 'DRAFT'
    },
    header: {
        slaughterDate: Date,
        sifNumber: { type: String, default: 'SIF 4141' },
        veterinarian: String,
        notes: String
    },
    lines: [closureLineSchema],
    totalCattle: { type: Number, default: 0 },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    closedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    closedAt: Date,
    reopenLog: [{
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
        reason: { type: String, required: true }
    }]
}, {
    timestamps: true
});

// Middleware para calcular totais antes de salvar
slaughterClosureSchema.pre('save', function (next) {
    let totalCattle = 0;
    this.lines.forEach(line => {
        line.total = (line.boi || 0) + (line.vaca || 0) + (line.novilha || 0) + (line.bubalino || 0) + (line.touro || 0);
        totalCattle += line.total;
    });
    this.totalCattle = totalCattle;
    next();
});

const SlaughterClosure = mongoose.model('SlaughterClosure', slaughterClosureSchema);

export default SlaughterClosure;
