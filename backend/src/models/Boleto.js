import mongoose from 'mongoose';

const boletoSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Descrição é obrigatória'],
        trim: true
    },
    value: {
        type: Number,
        required: [true, 'Valor é obrigatório'],
        min: 0
    },
    provider: {
        type: String,
        required: [true, 'Fornecedor é obrigatório'],
        trim: true
    },
    dueDate: {
        type: Date,
        required: [true, 'Data de vencimento é obrigatória']
    },
    deliverByDate: {
        type: Date,
        required: true
    },
    observation: String,
    status: {
        type: String,
        enum: ['pendente', 'pago', 'atrasado'],
        default: 'pendente'
    },
    paidAt: Date,
    barcode: String,
    filePath: String
}, {
    timestamps: true
});

// Índice para buscar boletos por vencimento
boletoSchema.index({ dueDate: 1 });
boletoSchema.index({ status: 1 });

// Virtual para verificar se está atrasado
boletoSchema.virtual('isOverdue').get(function () {
    return this.status === 'pendente' && this.dueDate < new Date();
});

// Método para calcular data de entrega (7 dias antes)
boletoSchema.pre('save', function (next) {
    if (this.isModified('dueDate') && !this.deliverByDate) {
        const deliverDate = new Date(this.dueDate);
        deliverDate.setDate(deliverDate.getDate() - 7);
        this.deliverByDate = deliverDate;
    }
    next();
});

const Boleto = mongoose.model('Boleto', boletoSchema);

export default Boleto;
