import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
    assetId: {
        type: String,
        required: [true, 'ID do ativo é obrigatório'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Descrição é obrigatória'],
        trim: true
    },
    fazenda_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fazenda'
    },
    type: {
        type: String,
        enum: [
            'trator', 'colheitadeira', 'plantadeira', 'pulverizador',
            'implemento', 'veiculo', 'irrigacao', 'silo', 'drone', 'infraestrutura',
            'computador', 'notebook', 'rede', 'software', 'outro'

        ],
        default: 'outro'
    },
    brand: {
        type: String,
        trim: true
    },
    model: {
        type: String,
        trim: true
    },
    serialNumber: {
        type: String,
        trim: true,
        sparse: true
    },
    location: {
        type: String,
        trim: true
    },
    acquisitionDate: Date,
    purchaseDate: Date,
    purchaseValue: {
        type: Number,
        min: 0
    },
    warrantyExpiration: Date,
    status: {
        type: String,
        enum: ['ativo', 'em_manutencao', 'disponivel', 'descartado', 'perdido'],
        default: 'ativo'
    },
    responsible: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    department: {
        type: String,
        trim: true
    },
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date,
    maintenanceInterval: {
        type: Number, // em dias
        default: 180
    },
    notes: String,
    customFields: {
        type: mongoose.Schema.Types.Mixed
    },
    category: {
        type: String,
        enum: ['hardware', 'software', 'network', 'maquina', 'implemento', 'infraestrutura'],
        default: 'hardware',
        index: true
    },
    network: {
        deviceType: {
            type: String,
            enum: ['switch', 'router', 'ap', 'firewall', 'modem', 'nvr', 'other']
        },
        hostname: String,
        mgmtIp: {
            type: String,
            trim: true
        },
        mac: String,
        firmwareVersion: String,
        snmpEnabled: Boolean,
        snmpVersion: {
            type: String,
            enum: ['v2c', 'v3']
        },
        uplinkDeviceAssetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Asset'
        },
        uplinkPort: String,
        vlans: [String]
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    // Rastreabilidade de compra
    purchaseOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseOrder'
    },
    purchaseRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseRequest'
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índice único parcial para IP de Gerência (apenas se preenchido e se for ativo de rede)
assetSchema.index(
    { 'network.mgmtIp': 1 },
    { unique: true, partialFilterExpression: { 'network.mgmtIp': { $type: "string" } } }
);

// Índices para performance do dashboard
assetSchema.index({ warrantyExpiration: 1 });
assetSchema.index({ nextMaintenanceDate: 1 });
assetSchema.index({ status: 1 });

// Virtual para manutenções
assetSchema.virtual('maintenances', {
    ref: 'Maintenance',
    localField: '_id',
    foreignField: 'asset'
});

// Virtual para timeline
assetSchema.virtual('timeline', {
    ref: 'AssetTimeline',
    localField: '_id',
    foreignField: 'asset'
});

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;
