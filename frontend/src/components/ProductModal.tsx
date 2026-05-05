import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { Package, Save, AlertCircle, Tag, Layers } from 'lucide-react';

interface ProductModalProps {
    product?: any;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    loading?: boolean;
}

const CATEGORIES = [
    'Peças Trator', 'Peças Colheitadeira', 'Peças Plantadeira', 'Peças Pulverizador',
    'Lubrificantes', 'Filtros', 'Ferramentas', 'EPI', 'Pneus', 'Insumos Agrícolas',
    'Sementes', 'Fertilizantes', 'Defensivos', 'Veterinária', 'Outros'
];

const UNITS = [
    'Unidade', 'Litro', 'Kg', 'Metro', 'Jogo', 'Caixa'
];

const ProductModal: React.FC<ProductModalProps> = ({
    product,
    isOpen,
    onClose,
    onSave,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        name: '',
        category: CATEGORIES[0],
        unit: UNITS[0],
        minQuantity: 0,
        currentQuantity: 0,
        description: ''
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                category: product.category || CATEGORIES[0],
                unit: product.unit || UNITS[0],
                minQuantity: product.minQuantity || 0,
                currentQuantity: product.quantity || 0,
                description: product.description || ''
            });
        } else {
            setFormData({
                name: '',
                category: CATEGORIES[0],
                unit: UNITS[0],
                minQuantity: 0,
                currentQuantity: 0,
                description: ''
            });
        }
        setError(null);
    }, [product, isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError('O nome do produto é obrigatório.');
            return;
        }

        try {
            await onSave(formData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao salvar produto');
        }
    };

    const modalFooter = (
        <>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancelar
            </button>
            <button
                type="button"
                className="btn-primary"
                disabled={loading}
                onClick={() => handleSubmit()}
                style={{
                    background: '#10b981',
                    padding: '12px 24px',
                }}
            >
                <Save size={18} />
                {loading ? 'Salvando...' : product ? 'Atualizar Produto' : 'Adicionar Produto'}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={product ? 'Editar Produto' : 'Novo Produto'}
            footer={modalFooter}
        >
            {error && (
                <div className="error-msg" style={{ marginBottom: '20px' }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <div className="form-group">
                <label className="required">Nome do Produto</label>
                <div style={{ position: 'relative' }}>
                    <Package size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                    <input
                        style={{ paddingLeft: '40px' }}
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Filtro de Óleo Massey"
                    />
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label>Categoria</label>
                    <div style={{ position: 'relative' }}>
                        <Tag size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                        <select
                            style={{ paddingLeft: '40px' }}
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label>Unidade de Medida</label>
                    <select
                        value={formData.unit}
                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    >
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label>Estoque Atual</label>
                    <div style={{ position: 'relative' }}>
                        <Layers size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                        <input
                            style={{ paddingLeft: '40px' }}
                            type="number"
                            value={formData.currentQuantity}
                            onChange={e => setFormData({ ...formData, currentQuantity: Number(e.target.value) })}
                            disabled={!!product} // Quantity should be managed via movements for existing products
                        />
                    </div>
                    {product && <small style={{ color: '#64748b' }}>Edite via movimentações para alterar o estoque.</small>}
                </div>
                <div className="form-group">
                    <label>Estoque Mínimo (Alerta)</label>
                    <input
                        type="number"
                        value={formData.minQuantity}
                        onChange={e => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Descrição / Observações</label>
                <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalhes técnicos, compatibilidade, local na prateleira..."
                    rows={3}
                />
            </div>
        </BaseModal>
    );
};

export default ProductModal;
