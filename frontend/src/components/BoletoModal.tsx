import React, { useState, useEffect } from 'react';
import { boletoService } from '../services';
import BaseModal from './BaseModal';

interface BoletoModalProps {
    boleto: any | null;
    onClose: () => void;
    onSave: () => void;
}

export const BoletoModal: React.FC<BoletoModalProps> = ({ boleto, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        description: '',
        provider: '',
        value: '',
        dueDate: '',
        deliverByDate: '',
        status: 'pendente',
        observation: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (boleto) {
            setFormData({
                description: boleto.description || '',
                provider: boleto.provider || '',
                value: boleto.value ? boleto.value.toString() : '',
                dueDate: boleto.dueDate ? boleto.dueDate.split('T')[0] : '',
                deliverByDate: boleto.deliverByDate ? boleto.deliverByDate.split('T')[0] : '',
                status: boleto.status || 'pendente',
                observation: boleto.observation || ''
            });
        }
    }, [boleto]);

    const validate = () => {
        const newErrors: any = {};
        if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
        if (!formData.provider.trim()) newErrors.provider = 'Fornecedor é obrigatório';
        if (!formData.value || parseFloat(formData.value) <= 0) newErrors.value = 'Valor inválido';
        if (!formData.dueDate) newErrors.dueDate = 'Data de vencimento é obrigatória';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            const dataToSend = {
                ...formData,
                value: parseFloat(formData.value)
            };

            if (boleto) {
                await boletoService.update(boleto._id, dataToSend);
            } else {
                await boletoService.create(dataToSend);
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar boleto:', error);
            alert('Erro ao salvar boleto');
        } finally {
            setLoading(false);
        }
    };

    const modalFooter = (
        <>
            <button type="button" className="btn-secondary" onClick={onClose}>
                Cancelar
            </button>
            <button
                type="button"
                className="btn-primary"
                disabled={loading}
                onClick={() => handleSubmit()}
                style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Salvando...' : boleto ? 'Atualizar Boleto' : 'Criar Boleto'}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title={boleto ? 'Editar Boleto' : 'Novo Boleto'}
            footer={modalFooter}
        >
            <div className="form-group">
                <label className="required">Descrição do Pagamento</label>
                <input
                    type="text"
                    className={errors.description ? 'field-error' : ''}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Mensalidade Internet, Energia Solar, etc"
                />
                {errors.description && <span className="error-msg">{errors.description}</span>}
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label className="required">Fornecedor / Beneficiário</label>
                    <input
                        type="text"
                        className={errors.provider ? 'field-error' : ''}
                        value={formData.provider}
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                        placeholder="Ex: Vivo, CPFL, Banco do Brasil"
                    />
                    {errors.provider && <span className="error-msg">{errors.provider}</span>}
                </div>

                <div className="form-group">
                    <label className="required">Valor (R$)</label>
                    <input
                        type="number"
                        step="0.01"
                        className={errors.value ? 'field-error' : ''}
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="0.00"
                    />
                    {errors.value && <span className="error-msg">{errors.value}</span>}
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label className="required">Data de Vencimento</label>
                    <input
                        type="date"
                        className={errors.dueDate ? 'field-error' : ''}
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                    {errors.dueDate && <span className="error-msg">{errors.dueDate}</span>}
                </div>

                <div className="form-group">
                    <label>Entregar p/ Financeiro Até</label>
                    <input
                        type="date"
                        value={formData.deliverByDate}
                        onChange={(e) => setFormData({ ...formData, deliverByDate: e.target.value })}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Status do Pagamento</label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                        borderLeft: `4px solid ${formData.status === 'pago' ? '#10b981' :
                                formData.status === 'atrasado' ? '#ef4444' :
                                    formData.status === 'entregue' ? '#3b82f6' : '#f59e0b'
                            }`
                    }}
                >
                    <option value="pendente">⏳ Pendente</option>
                    <option value="entregue">📤 Entregue ao Financeiro</option>
                    <option value="pago">✅ Pago</option>
                    <option value="atrasado">🚨 Atrasado</option>
                </select>
            </div>

            <div className="form-group">
                <label>Observações / Notas</label>
                <textarea
                    value={formData.observation}
                    onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                    rows={3}
                    placeholder="Adicione detalhes sobre o pagamento ou NF vinculada..."
                    style={{ resize: 'none' }}
                />
            </div>
        </BaseModal>
    );
};
