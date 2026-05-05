import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { Briefcase, Save, AlertCircle } from 'lucide-react';

interface VacancyModalProps {
    vacancy?: any;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    loading?: boolean;
}

const SECTORS = [
    'Campo', 'Manejo', 'Administrativo', 'Operacional', 'Logística', 'Manutenção'
];

const VacancyModal: React.FC<VacancyModalProps> = ({
    vacancy,
    isOpen,
    onClose,
    onSave,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        title: '',
        sector: SECTORS[0],
        description: '',
        requirements: '',
        status: 'OPEN'
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (vacancy) {
            setFormData({
                title: vacancy.title || '',
                sector: vacancy.sector || SECTORS[0],
                description: vacancy.description || '',
                requirements: vacancy.requirements || '',
                status: vacancy.status || 'OPEN'
            });
        } else {
            setFormData({
                title: '',
                sector: SECTORS[0],
                description: '',
                requirements: '',
                status: 'OPEN'
            });
        }
        setError(null);
    }, [vacancy, isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);

        if (!formData.title.trim()) {
            setError('O título da vaga é obrigatório.');
            return;
        }

        try {
            await onSave(formData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao salvar vaga');
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
                {loading ? 'Salvando...' : vacancy ? 'Atualizar Vaga' : 'Criar Vaga'}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={vacancy ? 'Editar Vaga' : 'Nova Vaga'}
            footer={modalFooter}
        >
            {error && (
                <div className="error-msg" style={{ marginBottom: '20px' }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <div className="form-group">
                <label className="required">Título da Vaga</label>
                <div style={{ position: 'relative' }}>
                    <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                    <input
                        style={{ paddingLeft: '40px' }}
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: Operador de Trator"
                    />
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label>Setor</label>
                    <select
                        value={formData.sector}
                        onChange={e => setFormData({ ...formData, sector: e.target.value })}
                    >
                        {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Status</label>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="OPEN">Aberta</option>
                        <option value="CLOSED">Fechada</option>
                        <option value="ARCHIVED">Arquivada</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>Descrição</label>
                <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva as responsabilidades da vaga..."
                    rows={4}
                />
            </div>

            <div className="form-group">
                <label>Requisitos</label>
                <textarea
                    value={formData.requirements}
                    onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="Ex: CNH D, Experiência com GPS..."
                    rows={3}
                />
            </div>
        </BaseModal>
    );
};

export default VacancyModal;
