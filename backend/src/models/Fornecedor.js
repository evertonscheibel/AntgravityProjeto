import mongoose from 'mongoose';

const documentoSchema = new mongoose.Schema({
    tipo: String, // "Contrato", "Certificado", "Alvará"
    nome: String,
    arquivo: String,
    validade: Date
});

const contatoSchema = new mongoose.Schema({
    nome: String,
    cargo: String,
    telefone: String,
    email: String,
    whatsapp: String,
    principal: {
        type: Boolean,
        default: false
    }
});

const fornecedorSchema = new mongoose.Schema({
    // Identificação
    razao_social: {
        type: String,
        required: [true, 'Razão social é obrigatória'],
        trim: true
    },
    nome_fantasia: {
        type: String,
        trim: true
    },
    tipo: {
        type: String,
        enum: ['pessoa_juridica', 'pessoa_fisica', 'produtor_rural'],
        required: true
    },
    cnpj_cpf: {
        type: String,
        required: [true, 'CNPJ/CPF é obrigatório'],
        unique: true,
        trim: true
    },
    inscricao_estadual: {
        type: String,
        trim: true
    },

    // Segmentação
    categorias: [{
        type: String,
        enum: [
            'insumos_agricolas',
            'combustivel_lubrificantes',
            'pecas_maquinario',
            'manutencao_servicos',
            'transporte_frete',
            'armazenagem',
            'equipamentos',
            'alimentos_consumo_interno',
            'escritorio_admin',
            'outro'
        ]
    }],

    fazendas_atende: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fazenda'
    }],

    // Contato
    contatos: [contatoSchema],

    // Endereço
    endereco: {
        cep: String,
        logradouro: String,
        numero: String,
        bairro: String,
        municipio: String,
        estado: String
    },

    // Dados bancários
    dados_bancarios: {
        banco: String,
        agencia: String,
        conta: String,
        tipo_conta: {
            type: String,
            enum: ['corrente', 'poupanca', 'pix']
        },
        chave_pix: String,
        favorecido: String
    },

    // Condições comerciais
    condicoes_comerciais: {
        prazo_pagamento_dias: Number,
        limite_credito: Number,
        desconto_percentual: Number,
        frete: {
            type: String,
            enum: ['cif', 'fob', 'a_combinar']
        },
        observacoes: String
    },

    // Avaliação (calculado automaticamente ou via avaliações)
    avaliacao: {
        nota_geral: { type: Number, default: 0 },
        nota_preco: { type: Number, default: 0 },
        nota_prazo: { type: Number, default: 0 },
        nota_qualidade: { type: Number, default: 0 },
        nota_atendimento: { type: Number, default: 0 },
        total_avaliacoes: { type: Number, default: 0 }
    },

    // Documentos
    documentos: [documentoSchema],

    // Histórico
    primeiro_fornecimento: Date,
    ultimo_fornecimento: Date,
    total_pedidos: { type: Number, default: 0 },
    total_comprado: { type: Number, default: 0 },

    status: {
        type: String,
        enum: ['ativo', 'inativo', 'bloqueado', 'em_analise'],
        default: 'em_analise'
    },
    motivo_bloqueio: String,
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

// Índices
fornecedorSchema.index({ cnpj_cpf: 1, company: 1 }, { unique: true });
fornecedorSchema.index({ razao_social: 'text', nome_fantasia: 'text' });
fornecedorSchema.index({ status: 1 });
fornecedorSchema.index({ categorias: 1 });

const Fornecedor = mongoose.model('Fornecedor', fornecedorSchema);

export default Fornecedor;
