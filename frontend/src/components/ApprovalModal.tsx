import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import BaseModal from './BaseModal';
import { purchaseRequestService } from '../services';

interface ApprovalModalProps {
    requestId: string;
    requestNumber: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
    requestId,
    requestNumber,
    onClose,
    onSuccess
}) => {
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (selectedAction: 'aprovar' | 'rejeitar') => {
        if (!comments.trim()) {
            alert('Por favor, adicione um comentário explicando sua decisão.');
            return;
        }

        setLoading(true);
        try {
            await purchaseRequestService.approve(requestId, { action: selectedAction, comments });

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Erro ao processar aprovação:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
            alert(`Erro: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const modalFooter = (
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                style={{ flex: 1 }}
            >
                Cancelar
            </button>
            <button
                type="button"
                className="btn-primary"
                onClick={() => handleSubmit('aprovar')}
                disabled={loading || !comments.trim()}
                style={{
                    flex: 1,
                    background: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}
            >
                <CheckCircle size={18} />
                {loading ? 'Processando...' : 'Aprovar'}
            </button>
            <button
                type="button"
                className="btn-primary"
                onClick={() => handleSubmit('rejeitar')}
                disabled={loading || !comments.trim()}
                style={{
                    flex: 1,
                    background: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}
            >
                <XCircle size={18} />
                {loading ? 'Processando...' : 'Reprovar'}
            </button>
        </div>
    );

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title="Aprovar/Reprovar Solicitação"
            footer={modalFooter}
        >
            <div style={{
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Solicitação em Analise
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                    {requestNumber}
                </div>
            </div>

            <div className="form-group">
                <label className="required">Comentários / Justificativa</label>
                <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Explique o motivo da sua decisão (obrigatório)..."
                    rows={5}
                    style={{ resize: 'none' }}
                />
            </div>
        </BaseModal>
    );
};
