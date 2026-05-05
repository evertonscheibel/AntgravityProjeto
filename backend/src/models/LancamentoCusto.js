import mongoose from 'mongoose';

const lancamentoCustoSchema = new mongoose.Schema({
    fazenda_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fazenda',
        required: true
    },
    centro_custo_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CentroCusto',
        required: true
    },
    safra_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Safra'
    },
    talhao_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Talhao'
    },
    data: {
        type: Date,
        default: Date.now
    },
    descricao: {
        type: String,
        required: true
    },
    categoria: {
        type: String,
        enum: [
            // Custos de produção
            'sementes',
            'defensivos_herbicidas',
            'defensivos_inseticidas',
            'defensivos_fungicidas',
            'fertilizantes_plantio',
            'fertilizantes_cobertura',
            'corretivos_solo',
            // Mecanização
            'combustivel',
            'lubrificantes',
            'manutencao_maquinas',
            'pecas_reposicao',
            'servico_terceirizado',
            // Mão de obra
            'salarios',
            'encargos',
            'mao_obra_temporaria',
            'hora_extra',
            // Infraestrutura
            'arrendamento',
            'energia_eletrica',
            'agua_irrigacao',
            'manutencao_infraestrutura',
            // Pós-colheita
            'frete',
            'armazenagem',
            'secagem',
            'classificacao',
            // Administrativo
            'assistencia_tecnica',
            'seguro_rural',
            'juros_financiamento',
            'outros'
        ],
        required: true
    },
    valor: {
        type: Number,
        required: true
    },
    quantidade: {
        type: Number,
        default: 1
    },
    unidade: String, // L, kg, h, etc
    custo_unitario: {
        type: Number
    },
    origem: {
        type: String,
        enum: ['manual', 'compra', 'manejo', 'manutencao', 'folha', 'insumo'],
        default: 'manual'
    },
    origem_id: mongoose.Schema.Types.ObjectId,
    nota_fiscal: String,
    fornecedor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fornecedor'
    },
    rateio: [{
        talhao_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Talhao'
        },
        percentual: Number, // % do custo rateado nesse talhão
        valor_rateado: Number
    }],
    aprovado: {
        type: Boolean,
        default: false
    },
    aprovado_por: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    observacoes: String,
    company: {
        type: String,
        required: true
    },
    criado_por: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Middleware pre-save para calcular custo unitário
lancamentoCustoSchema.pre('save', function (next) {
    if (this.quantidade > 0) {
        this.custo_unitario = this.valor / this.quantidade;
    }
    next();
});

// Middleware post-save para atualizar o custo realizado no centro de custo
lancamentoCustoSchema.post('save', async function () {
    const CentroCusto = mongoose.model('CentroCusto');
    const stats = await this.constructor.aggregate([
        { $match: { centro_custo_id: this.centro_custo_id } },
        {
            $group: {
                _id: '$centro_custo_id',
                total: { $sum: '$valor' }
            }
        }
    ]);

    if (stats.length > 0) {
        await CentroCusto.findByIdAndUpdate(this.centro_custo_id, {
            custo_realizado: stats[0].total
        });
    }
});

const LancamentoCusto = mongoose.model('LancamentoCusto', lancamentoCustoSchema);

export default LancamentoCusto;
