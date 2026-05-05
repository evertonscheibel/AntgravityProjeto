import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { fornecedorService } from '../services';
import {
    Building2, MapPin, Phone, Mail,
    Globe, CreditCard, FileText, Plus, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';

interface FornecedorModalProps {
    fornecedor?: any;
    onClose: () => void;
    onSave: () => void;
}

const CATEGORIAS = [
    { value: 'insumos_agricolas', label: 'Insumos Agrícolas' },
    { value: 'combustivel_lubrificantes', label: 'Combustível & Lubrificantes' },
    { value: 'pecas_maquinario', label: 'Peças de Maquinário' },
    { value: 'manutencao_servicos', label: 'Manutenção & Serviços' },
    { value: 'transporte_frete', label: 'Transporte & Frete' },
    { value: 'armazenagem', label: 'Armazenagem' },
    { value: 'equipamentos', label: 'Equipamentos' },
    { value: 'alimentos_consumo_interno', label: 'Alimentos (Consumo)' },
    { value: 'escritorio_admin', label: 'Escritório & Admin' },
    { value: 'outro', label: 'Outro' }
];

export const FornecedorModal: React.FC<FornecedorModalProps> = ({ fornecedor, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        razao_social: '',
        nome_fantasia: '',
        tipo: 'pessoa_juridica',
        cnpj_cpf: '',
        inscricao_estadual: '',
        categorias: [] as string[],
        endereco: {
            cep: '',
            logradouro: '',
            numero: '',
            bairro: '',
            municipio: '',
            estado: ''
        },
        dados_bancarios: {
            banco: '',
            agencia: '',
            conta: '',
            tipo_conta: 'corrente',
            chave_pix: '',
            favorecido: ''
        },
        condicoes_comerciais: {
            prazo_pagamento_dias: 0,
            limite_credito: 0,
            desconto_percentual: 0,
            frete: 'a_combinar',
            observacoes: ''
        },
        status: 'em_analise',
        observacoes: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (fornecedor) {
            setFormData({
                ...formData,
                ...fornecedor,
                endereco: { ...formData.endereco, ...fornecedor.endereco },
                dados_bancarios: { ...formData.dados_bancarios, ...fornecedor.dados_bancarios },
                condicoes_comerciais: { ...formData.condicoes_comerciais, ...fornecedor.condicoes_comerciais }
            });
        }
    }, [fornecedor]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (fornecedor) {
                await fornecedorService.update(fornecedor._id, formData);
                toast.success('Fornecedor atualizado com sucesso');
            } else {
                await fornecedorService.create(formData);
                toast.success('Fornecedor cadastrado com sucesso');
            }
            onSave();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao salvar fornecedor');
        } finally {
            setLoading(false);
        }
    };

    const toggleCategoria = (value: string) => {
        const newCats = formData.categorias.includes(value)
            ? formData.categorias.filter(c => c !== value)
            : [...formData.categorias, value];
        setFormData({ ...formData, categorias: newCats });
    };

    const modalFooter = (
        <>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button
                type="submit"
                form="fornecedor-form"
                className="btn-primary"
                disabled={loading}
                style={{ background: '#10b981' }}
            >
                {loading ? 'Salvando...' : fornecedor ? 'Atualizar Fornecedor' : 'Cadastrar Fornecedor'}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title={fornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            footer={modalFooter}
            maxWidth="1000px"
        >
            <form id="fornecedor-form" onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                    {/* Coluna 1: Identificação e Endereço */}
                    <div>
                        <h4 style={{ marginBottom: '16px', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                            Identificação
                        </h4>

                        <div className="form-group">
                            <label className="required">Razão Social</label>
                            <input
                                type="text"
                                required
                                value={formData.razao_social}
                                onChange={e => setFormData({ ...formData, razao_social: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Nome Fantasia</label>
                            <input
                                type="text"
                                value={formData.nome_fantasia}
                                onChange={e => setFormData({ ...formData, nome_fantasia: e.target.value })}
                            />
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label className="required">Tipo</label>
                                <select
                                    value={formData.tipo}
                                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                >
                                    <option value="pessoa_juridica">Pessoa Jurídica</option>
                                    <option value="pessoa_fisica">Pessoa Física</option>
                                    <option value="produtor_rural">Produtor Rural</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="required">CNPJ / CPF</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.cnpj_cpf}
                                    onChange={e => setFormData({ ...formData, cnpj_cpf: e.target.value })}
                                />
                            </div>
                        </div>

                        <h4 style={{ margin: '24px 0 16px', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                            Endereço
                        </h4>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>CEP</label>
                                <input
                                    type="text"
                                    value={formData.endereco.cep}
                                    onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, cep: e.target.value } })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Estado (UF)</label>
                                <input
                                    type="text"
                                    maxLength={2}
                                    value={formData.endereco.estado}
                                    onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, estado: e.target.value.toUpperCase() } })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Cidade</label>
                            <input
                                type="text"
                                value={formData.endereco.municipio}
                                onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, municipio: e.target.value } })}
                            />
                        </div>
                    </div>

                    {/* Coluna 2: Categorias e Financeiro */}
                    <div>
                        <h4 style={{ marginBottom: '16px', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                            Segmentação & Categorias
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
                            {CATEGORIAS.map(cat => (
                                <label key={cat.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.categorias.includes(cat.value)}
                                        onChange={() => toggleCategoria(cat.value)}
                                    />
                                    {cat.label}
                                </label>
                            ))}
                        </div>

                        <h4 style={{ marginBottom: '16px', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                            Dados Financeiros
                        </h4>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Banco</label>
                                <input
                                    type="text"
                                    value={formData.dados_bancarios.banco}
                                    onChange={e => setFormData({ ...formData, dados_bancarios: { ...formData.dados_bancarios, banco: e.target.value } })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Tipo de Conta</label>
                                <select
                                    value={formData.dados_bancarios.tipo_conta}
                                    onChange={e => setFormData({ ...formData, dados_bancarios: { ...formData.dados_bancarios, tipo_conta: e.target.value } })}
                                >
                                    <option value="corrente">Corrente</option>
                                    <option value="poupanca">Poupança</option>
                                    <option value="pix">PIX</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Chave PIX</label>
                            <input
                                type="text"
                                value={formData.dados_bancarios.chave_pix}
                                onChange={e => setFormData({ ...formData, dados_bancarios: { ...formData.dados_bancarios, chave_pix: e.target.value } })}
                            />
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Prazo Pagto (Dias)</label>
                                <input
                                    type="number"
                                    value={formData.condicoes_comerciais.prazo_pagamento_dias}
                                    onChange={e => setFormData({ ...formData, condicoes_comerciais: { ...formData.condicoes_comerciais, prazo_pagamento_dias: parseInt(e.target.value) } })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Frete Padrão</label>
                                <select
                                    value={formData.condicoes_comerciais.frete}
                                    onChange={e => setFormData({ ...formData, condicoes_comerciais: { ...formData.condicoes_comerciais, frete: e.target.value } })}
                                >
                                    <option value="a_combinar">A Combinar</option>
                                    <option value="cif">CIF (Por conta do Fornecedor)</option>
                                    <option value="fob">FOB (Por conta do Comprador)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: '24px' }}>
                    <label>Observações Internas</label>
                    <textarea
                        rows={3}
                        value={formData.observacoes}
                        onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                    />
                </div>
            </form>
        </BaseModal>
    );
};
