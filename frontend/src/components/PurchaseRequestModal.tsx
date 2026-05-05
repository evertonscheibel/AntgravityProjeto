import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BaseModal from './BaseModal';
import { purchaseRequestService } from '../services';

interface PurchaseRequest {
    _id?: string;
    requestNumber?: string;
    title: string;
    description: string;
    category: string;
    quantity: number;
    estimatedValue: number;
    totalValue?: number;
    department: string;
    urgency: string;
    justification: string;
    status?: string;
}

interface PurchaseRequestModalProps {
    request: PurchaseRequest | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const PurchaseRequestModal: React.FC<PurchaseRequestModalProps> = ({
    request,
    onClose,
    onSuccess
}) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [formData, setFormData] = useState<PurchaseRequest>({
        title: request?.title || '',
        description: request?.description || '',
        category: request?.category || 'outro',
        quantity: request?.quantity || 1,
        estimatedValue: request?.estimatedValue || 0,
        department: request?.department || '',
        urgency: request?.urgency || 'media',
        justification: request?.justification || '',
        status: request?.status || 'rascunho'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' || name === 'estimatedValue' ? parseFloat(value) || 0 : value
        }));
    };

    const calculateTotal = () => {
        return formData.quantity * formData.estimatedValue;
    };

    const validate = () => {
        const newErrors: any = {};
        if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
        if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
        if (!formData.department.trim()) newErrors.department = 'Departamento é obrigatório';
        if (formData.estimatedValue <= 0) newErrors.estimatedValue = 'Valor deve ser maior que zero';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            const dataToSend: any = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                quantity: formData.quantity,
                estimatedValue: formData.estimatedValue,
                totalValue: calculateTotal(),
                department: formData.department,
                urgency: formData.urgency,
                justification: formData.justification
            };

            if (request?._id) {
                dataToSend.status = formData.status;
                await purchaseRequestService.update(request._id, dataToSend);
            } else {
                await purchaseRequestService.create(dataToSend);
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Erro ao salvar solicitação:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
            alert(`Erro ao salvar solicitação: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const modalFooter = (
        <>
            <button type="button" className="btn-secondary" onClick={onClose}>
                {request ? 'Fechar' : 'Cancelar'}
            </button>
            {!request && (
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
                    {loading ? 'Salvando...' : 'Criar Solicitação'}
                </button>
            )}
        </>
    );

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title={request ? 'Detalhes da Solicitação' : 'Nova Solicitação de Compra'}
            footer={modalFooter}
        >
            <div className="form-group">
                <label className="required">Título</label>
                <input
                    type="text"
                    name="title"
                    className={errors.title ? 'field-error' : ''}
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: Compra de notebooks para equipe"
                    disabled={!!request}
                />
                {errors.title && <span className="error-msg">{errors.title}</span>}
            </div>

            <div className="form-group">
                <label className="required">Descrição</label>
                <textarea
                    name="description"
                    className={errors.description ? 'field-error' : ''}
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Descreva detalhadamente o que precisa ser comprado"
                    disabled={!!request}
                />
                {errors.description && <span className="error-msg">{errors.description}</span>}
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label className="required">Categoria</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        disabled={!!request}
                    >
                        <option value="hardware">Hardware</option>
                        <option value="software">Software</option>
                        <option value="servico">Serviço</option>
                        <option value="consumivel">Consumível</option>
                        <option value="insumos">Insumos Agrícolas</option>
                        <option value="pecas">Peças de Reposição</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="required">Departamento / Setor</label>
                    <input
                        type="text"
                        name="department"
                        className={errors.department ? 'field-error' : ''}
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Ex: TI, RH, Financeiro, Campo"
                        disabled={!!request}
                    />
                    {errors.department && <span className="error-msg">{errors.department}</span>}
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label className="required">Quantidade</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="1"
                        step="1"
                        disabled={!!request}
                    />
                </div>

                <div className="form-group">
                    <label className="required">Valor Unitário Estimado</label>
                    <input
                        type="number"
                        name="estimatedValue"
                        className={errors.estimatedValue ? 'field-error' : ''}
                        value={formData.estimatedValue}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        disabled={!!request}
                    />
                    {errors.estimatedValue && <span className="error-msg">{errors.estimatedValue}</span>}
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label className="required">Urgência</label>
                    <select
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleChange}
                        disabled={!!request}
                    >
                        <option value="baixa">🟢 Baixa</option>
                        <option value="media">🟡 Média</option>
                        <option value="alta">🟠 Alta</option>
                        <option value="critica">🔴 Crítica</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Valor Total Estimado</label>
                    <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '10px', fontSize: '18px', fontWeight: '700', color: '#166534', border: '1px solid #bbf7d0' }}>
                        {formatCurrency(calculateTotal())}
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label className="required">Justificativa</label>
                <textarea
                    name="justification"
                    value={formData.justification}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Justifique a necessidade desta compra"
                    disabled={!!request}
                />
            </div>

            {request && (user?.role === 'admin' || user?.role === 'tecnico') && (
                <div className="form-group">
                    <label>Alterar Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        style={{ borderLeft: '4px solid #3b82f6' }}
                    >
                        <option value="rascunho">Rascunho</option>
                        <option value="aguardando_cotacao">Aguardando Cotação</option>
                        <option value="em_cotacao">Em Cotação</option>
                        <option value="aguardando_aprovacao">Aguardando Aprovação</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="rejeitado">Rejeitado</option>
                        <option value="cancelado">Cancelado</option>
                        <option value="concluido">Concluído</option>
                    </select>
                </div>
            )}

            {request && (
                <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', fontSize: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#64748b' }}>Número da Solicitação:</span>
                        <span style={{ fontWeight: 600 }}>{request.requestNumber}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Solicitante:</span>
                        <span style={{ fontWeight: 600 }}>{user?.name || 'N/A'}</span>
                    </div>
                </div>
            )}
        </BaseModal>
    );
};
