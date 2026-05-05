import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { User, Mail, Phone, Save, AlertCircle } from 'lucide-react';

interface CandidateModalProps {
    candidate?: any;
    vacancies: any[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    loading?: boolean;
}

const CandidateModal: React.FC<CandidateModalProps> = ({
    candidate,
    vacancies,
    isOpen,
    onClose,
    onSave,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        vacancy: '',
        status: 'APPLIED',
        linkedIn: '',
        city: ''
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (candidate) {
            setFormData({
                name: candidate.name || '',
                email: candidate.email || '',
                phone: candidate.phone || '',
                vacancy: candidate.vacancy?._id || candidate.vacancy || '',
                status: candidate.status || 'APPLIED',
                linkedIn: candidate.linkedIn || '',
                city: candidate.city || ''
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                vacancy: vacancies.length > 0 ? vacancies[0]._id : '',
                status: 'APPLIED',
                linkedIn: '',
                city: ''
            });
        }
        setError(null);
    }, [candidate, isOpen, vacancies]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError('O nome do candidato é obrigatório.');
            return;
        }
        if (!formData.vacancy) {
            setError('Selecione uma vaga.');
            return;
        }

        try {
            await onSave(formData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao salvar candidato');
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
                    background: '#2563eb',
                    padding: '12px 24px',
                }}
            >
                <Save size={18} />
                {loading ? 'Salvando...' : candidate ? 'Atualizar Candidato' : 'Cadastrar Candidato'}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={candidate ? 'Editar Candidato' : 'Novo Candidato'}
            footer={modalFooter}
        >
            {error && (
                <div className="error-msg" style={{ marginBottom: '20px' }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <div className="form-group">
                <label className="required">Nome Completo</label>
                <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                    <input
                        style={{ paddingLeft: '40px' }}
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: João da Silva"
                    />
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label>E-mail</label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                        <input
                            style={{ paddingLeft: '40px' }}
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="joao@email.com"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Telefone</label>
                    <div style={{ position: 'relative' }}>
                        <Phone size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                        <input
                            style={{ paddingLeft: '40px' }}
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label className="required">Vaga Pretendida</label>
                    <select
                        value={formData.vacancy}
                        onChange={e => setFormData({ ...formData, vacancy: e.target.value })}
                    >
                        <option value="">Selecione a vaga...</option>
                        {vacancies.map(v => (
                            <option key={v._id} value={v._id}>{v.title} ({v.sector})</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Status</label>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="APPLIED">Inscrito</option>
                        <option value="INTERVIEW">Entrevista</option>
                        <option value="HIRED">Contratado</option>
                        <option value="REJECTED">Recusado</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>Cidade / Localização</label>
                <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ex: Primavera do Leste - MT"
                />
            </div>
        </BaseModal>
    );
};

export default CandidateModal;
