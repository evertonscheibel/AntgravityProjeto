import React, { useState, useEffect } from 'react';
import { certificateService } from '../services';
import BaseModal from './BaseModal';

interface CertificateModalProps {
    certificate: any | null;
    onClose: () => void;
    onSave: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'ssl',
        provider: '',
        issueDate: '',
        expirationDate: '',
        status: 'ativo',
        notifyBeforeDays: 30,
        autoRenew: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (certificate) {
            setFormData({
                name: certificate.name || '',
                type: certificate.type || 'ssl',
                provider: certificate.provider || '',
                issueDate: certificate.issueDate ? certificate.issueDate.split('T')[0] : '',
                expirationDate: certificate.expirationDate ? certificate.expirationDate.split('T')[0] : '',
                status: certificate.status || 'ativo',
                notifyBeforeDays: certificate.notifyBeforeDays || 30,
                autoRenew: certificate.autoRenew || false
            });
        }
    }, [certificate]);

    const validate = () => {
        const newErrors: any = {};
        if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
        if (!formData.issueDate) newErrors.issueDate = 'Data de emissão é obrigatória';
        if (!formData.expirationDate) newErrors.expirationDate = 'Data de expiração é obrigatória';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            if (certificate) {
                await certificateService.update(certificate._id, formData);
            } else {
                await certificateService.create(formData);
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar certificado:', error);
            alert('Erro ao salvar certificado');
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
                onClick={handleSubmit}
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
                {loading ? 'Salvando...' : certificate ? 'Atualizar Certificado' : 'Criar Certificado'}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title={certificate ? 'Editar Certificado' : 'Novo Certificado'}
            footer={modalFooter}
        >
            <div className="form-group">
                <label className="required">Nome do Certificado</label>
                <input
                    type="text"
                    className={errors.name ? 'field-error' : ''}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: SSL Wildcard *.empresa.com"
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label className="required">Tipo</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="ssl">SSL / TLS</option>
                        <option value="software">Licença de Software</option>
                        <option value="dominio">Domínio</option>
                        <option value="contrato">Contrato de Suporte</option>
                        <option value="car">CAR (Agrário)</option>
                        <option value="ccir">CCIR (Agrário)</option>
                        <option value="itr">ITR (Agrário)</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Fornecedor</label>
                    <input
                        type="text"
                        value={formData.provider}
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                        placeholder="Ex: GoDaddy, Microsoft"
                    />
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label className="required">Data de Emissão</label>
                    <input
                        type="date"
                        className={errors.issueDate ? 'field-error' : ''}
                        value={formData.issueDate}
                        onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label className="required">Data de Expiração</label>
                    <input
                        type="date"
                        className={errors.expirationDate ? 'field-error' : ''}
                        value={formData.expirationDate}
                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    />
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label>Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="ativo">✅ Ativo</option>
                        <option value="expirado">❌ Expirado</option>
                        <option value="revogado">🚫 Revogado</option>
                        <option value="pendente">⏳ Pendente</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Notificar antes de (dias)</label>
                    <input
                        type="number"
                        value={formData.notifyBeforeDays}
                        onChange={(e) => setFormData({ ...formData, notifyBeforeDays: parseInt(e.target.value) || 0 })}
                        min="1"
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px' }}>
                    <input
                        type="checkbox"
                        checked={formData.autoRenew}
                        onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                        style={{ width: '20px', height: '20px' }}
                    />
                    <span style={{ fontWeight: 600, color: '#374151' }}>Renovação Automática</span>
                </label>
            </div>
        </BaseModal>
    );
};
