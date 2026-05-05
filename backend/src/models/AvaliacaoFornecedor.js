import mongoose from 'mongoose';

const avaliacaoFornecedorSchema = new mongoose.Schema({
    fornecedor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fornecedor',
        required: true
    },
    fazenda_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fazenda',
        required: true
    },
    compra_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseOrder' // Assuming PurchaseOrder is the correct reference
    },
    avaliador_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    data: {
        type: Date,
        default: Date.now
    },
    notas: {
        preco: { type: Number, min: 1, max: 5 },
        prazo_entrega: { type: Number, min: 1, max: 5 },
        qualidade_produto: { type: Number, min: 1, max: 5 },
        atendimento: { type: Number, min: 1, max: 5 }
    },
    entrega_no_prazo: Boolean,
    quantidade_correta: Boolean,
    produto_conforme: Boolean,
    comentario: String,
    recomendaria: Boolean,
    company: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Middleware post-save para atualizar a média do fornecedor
avaliacaoFornecedorSchema.post('save', async function () {
    const Fornecedor = mongoose.model('Fornecedor');
    const stats = await this.constructor.aggregate([
        { $match: { fornecedor_id: this.fornecedor_id } },
        {
            $group: {
                _id: '$fornecedor_id',
                nota_geral: { $avg: { $avg: ['$notas.preco', '$notas.prazo_entrega', '$notas.qualidade_produto', '$notas.atendimento'] } },
                nota_preco: { $avg: '$notas.preco' },
                nota_prazo: { $avg: '$notas.prazo_entrega' },
                nota_qualidade: { $avg: '$notas.qualidade_produto' },
                nota_atendimento: { $avg: '$notas.atendimento' },
                total_avaliacoes: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await Fornecedor.findByIdAndUpdate(this.fornecedor_id, {
            avaliacao: stats[0]
        });
    }
});

const AvaliacaoFornecedor = mongoose.model('AvaliacaoFornecedor', avaliacaoFornecedorSchema);

export default AvaliacaoFornecedor;
