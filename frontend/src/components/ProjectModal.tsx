import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { Save, AlertCircle, Folder, Calendar, Target } from 'lucide-react';

interface ProjectModalProps {
    project?: any;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    loading?: boolean;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
    project,
    isOpen,
    onClose,
    onSave,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        methodology: 'KANBAN',
        endDate: ''
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                methodology: project.methodology || 'KANBAN',
                endDate: project.endDate ? project.endDate.split('T')[0] : ''
            });
        } else {
            setFormData({
                name: '',
                description: '',
                methodology: 'KANBAN',
                endDate: ''
            });
        }
        setError(null);
    }, [project, isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError('O nome do projeto é obrigatório.');
            return;
        }

        try {
            await onSave(formData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao salvar projeto');
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
                {loading ? 'Salvando...' : project ? 'Atualizar Projeto' : 'Criar Projeto'}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={project ? 'Editar Projeto' : 'Novo Projeto'}
            footer={modalFooter}
        >
            {error && (
                <div className="error-msg" style={{ marginBottom: '20px' }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <div className="form-group">
                <label className="required">Nome do Projeto</label>
                <div style={{ position: 'relative' }}>
                    <Folder size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                    <input
                        style={{ paddingLeft: '40px' }}
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Expansão da Safra 2024"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Descrição</label>
                <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva os objetivos e escopo do projeto..."
                    rows={4}
                />
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label>Metodologia</label>
                    <div style={{ position: 'relative' }}>
                        <Target size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                        <select
                            style={{ paddingLeft: '40px' }}
                            value={formData.methodology}
                            onChange={e => setFormData({ ...formData, methodology: e.target.value })}
                        >
                            <option value="KANBAN">Kanban</option>
                            <option value="SCRUM">Scrum</option>
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label>Data de Término (Estimada)</label>
                    <div style={{ position: 'relative' }}>
                        <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                        <input
                            style={{ paddingLeft: '40px' }}
                            type="date"
                            value={formData.endDate}
                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default ProjectModal;
