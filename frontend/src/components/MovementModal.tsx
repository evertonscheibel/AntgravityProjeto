import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { RefreshCw, Save, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface MovementModalProps {
    products: any[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    loading?: boolean;
}

const MovementModal: React.FC<MovementModalProps> = ({
    products,
    isOpen,
    onClose,
    onSave,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        product: '',
        type: 'IN',
        quantity: 1,
        notes: ''
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                product: products.length > 0 ? products[0]._id : '',
                type: 'IN',
                quantity: 1,
                notes: ''
            });
            setError(null);
        }
    }, [isOpen, products]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);

        if (!formData.product) {
            setError('Selecione um produto.');
            return;
        }
        if (formData.quantity <= 0) {
            setError('A quantidade deve ser maior que zero.');
            return;
        }

        try {
            await onSave(formData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao registrar movimentação');
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
                    background: formData.type === 'IN' ? '#10b981' : '#ef4444',
                    padding: '12px 24px',
                }}
            >
                <Save size={18} />
                {loading ? 'Processando...' : `Confirmar ${formData.type === 'IN' ? 'Entrada' : 'Saída'}`}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Registrar Movimentação de Estoque"
            footer={modalFooter}
        >
            {error && (
                <div className="error-msg" style={{ marginBottom: '20px' }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <div className="form-group">
                <label className="required">Produto</label>
                <select
                    value={formData.product}
                    onChange={e => setFormData({ ...formData, product: e.target.value })}
                >
                    <option value="">Selecione o produto...</option>
                    {products.map(p => (
                        <option key={p._id} value={p._id}>
                            {p.name} (Atual: {p.quantity} {p.unit})
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label className="required">Tipo de Operação</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'IN' })}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '10px',
                                border: '2px solid',
                                borderColor: formData.type === 'IN' ? '#10b981' : '#e2e8f0',
                                background: formData.type === 'IN' ? '#f0fdf4' : 'white',
                                color: formData.type === 'IN' ? '#10b981' : '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            <ArrowUpRight size={18} /> Entrada
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'OUT' })}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '10px',
                                border: '2px solid',
                                borderColor: formData.type === 'OUT' ? '#ef4444' : '#e2e8f0',
                                background: formData.type === 'OUT' ? '#fef2f2' : 'white',
                                color: formData.type === 'OUT' ? '#ef4444' : '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            <ArrowDownLeft size={18} /> Saída
                        </button>
                    </div>
                </div>
                <div className="form-group">
                    <label className="required">Quantidade</label>
                    <input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Motivo / Observação</label>
                <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ex: Nota Fiscal 123, Conserto do trator X..."
                    rows={3}
                />
            </div>
        </BaseModal>
    );
};

export default MovementModal;
