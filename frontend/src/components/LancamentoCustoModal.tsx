import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { custosService, fazendaService, fornecedorService } from '../services';
import { toast } from 'react-toastify';

interface LancamentoCustoModalProps {
    lancamento?: any;
    onClose: () => void;
    onSave: () => void;
}

const CATEGORIAS_CUSTO = [
    { value: 'sementes', label: 'Sementes' },
    { value: 'defensivos_herbicidas', label: 'Defensivos - Herbicidas' },
    { value: 'defensivos_inseticidas', label: 'Defensivos - Inseticidas' },
    { value: 'defensivos_fungicidas', label: 'Defensivos - Fungicidas' },
    { value: 'fertilizantes_plantio', label: 'Fertilizantes - Plantio' },
    { value: 'combustivel', label: 'Combustível' },
    { value: 'pecas_reposicao', label: 'Peças de Reposição' },
    { value: 'salarios', label: 'Salários' },
    { value: 'arrendamento', label: 'Arrendamento' },
    { value: 'outros', label: 'Outros' }
];

export const LancamentoCustoModal: React.FC<LancamentoCustoModalProps> = ({ lancamento, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        fazenda_id: '',
        centro_custo_id: '',
        safra_id: '',
        data: new Date().toISOString().split('T')[0],
        descricao: '',
        categoria: 'outros',
        valor: 0,
        quantidade: 1,
        unidade: '',
        fornecedor_id: '',
        origem: 'manual',
        nota_fiscal: '',
        observacoes: ''
    });

    const [fazendas, setFazendas] = useState<any[]>([]);
    const [fornecedores, setFornecedores] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [fazRes, fornRes] = await Promise.all([
                    fazendaService.getAll(),
                    fornecedorService.getAll()
                ]);
                setFazendas(fazRes.data || []);
                setFornecedores(fornRes.data || []);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            }
        };
        fetchData();

        if (lancamento) {
            setFormData({
                ...formData,
                ...lancamento,
                data: new Date(lancamento.data).toISOString().split('T')[0]
            });
        }
    }, [lancamento]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (lancamento) {
                await custosService.updateLancamento(lancamento._id, formData);
                toast.success('Lançamento atualizado');
            } else {
                await custosService.createLancamento(formData);
                toast.success('Custo lançado com sucesso');
            }
            onSave();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao salvar lançamento');
        } finally {
            setLoading(false);
        }
    };

    const modalFooter = (
        <>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button
                type="submit"
                form="custo-form"
                className="btn-primary"
                disabled={loading}
                style={{ background: '#3b82f6' }}
            >
                {loading ? 'Processando...' : lancamento ? 'Atualizar Dados' : 'Lançar Custo'}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title={lancamento ? 'Editar Lançamento' : 'Novo Lançamento de Custo'}
            footer={modalFooter}
        >
            <form id="custo-form" onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                        <label className="required">Fazenda</label>
                        <select
                            required
                            value={formData.fazenda_id}
                            onChange={e => setFormData({ ...formData, fazenda_id: e.target.value })}
                        >
                            <option value="">Selecionar Fazenda...</option>
                            {fazendas.map(f => (
                                <option key={f._id} value={f._id}>{f.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="required">Data</label>
                        <input
                            type="date"
                            required
                            value={formData.data}
                            onChange={e => setFormData({ ...formData, data: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="required">Descrição</label>
                    <input
                        type="text"
                        required
                        placeholder="Ex: Compra de Fertilizantes"
                        value={formData.descricao}
                        onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                        <label className="required">Categoria</label>
                        <select
                            value={formData.categoria}
                            onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                        >
                            {CATEGORIAS_CUSTO.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="required">Valor Total (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.valor}
                            onChange={e => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Fornecedor</label>
                        <select
                            value={formData.fornecedor_id}
                            onChange={e => setFormData({ ...formData, fornecedor_id: e.target.value })}
                        >
                            <option value="">Nenhum / Diversos</option>
                            {fornecedores.map(f => (
                                <option key={f._id} value={f._id}>{f.nome_fantasia || f.razao_social}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                        <label>Nota Fiscal</label>
                        <input
                            type="text"
                            value={formData.nota_fiscal}
                            onChange={e => setFormData({ ...formData, nota_fiscal: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Centro de Custo (ID)</label>
                        <input
                            type="text"
                            placeholder="Mapeie para uma safra/projeto"
                            value={formData.centro_custo_id}
                            onChange={e => setFormData({ ...formData, centro_custo_id: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Observações</label>
                    <textarea
                        rows={2}
                        value={formData.observacoes}
                        onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                    />
                </div>
            </form>
        </BaseModal>
    );
};
