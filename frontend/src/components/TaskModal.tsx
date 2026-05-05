import React, { useState, useEffect } from 'react';
import { ProjectTask } from '../services/projectService';
import { Ticket as TicketIcon, AlertCircle } from 'lucide-react';
import BaseModal from './BaseModal';
import { userService } from '../services';

interface TaskModalProps {
    task?: Partial<ProjectTask>;
    projectId: string;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, projectId, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'medium',
        storyPoints: task?.storyPoints || 0,
        assignedTo: task?.assignedTo?._id || ''
    });
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await userService.getAll();
                setUsers(data.data || []);
            } catch (error) {
                console.error('Erro ao carregar usuários:', error);
            }
        };
        fetchUsers();
    }, []);

    const validate = () => {
        const newErrors: any = {};
        if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Erro ao salvar tarefa:', error);
            alert('Erro ao salvar tarefa');
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
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Salvando...' : 'Salvar Tarefa'}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title={task?._id ? 'Editar Tarefa' : 'Nova Tarefa'}
            footer={modalFooter}
        >
            <div className="form-group">
                <label className="required">Título da Tarefa</label>
                <input
                    type="text"
                    className={errors.title ? 'field-error' : ''}
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="O que precisa ser feito?"
                />
                {errors.title && <span className="error-msg">{errors.title}</span>}
            </div>

            <div className="form-group">
                <label>Descrição Detalhada</label>
                <textarea
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva os requisitos e critérios de aceite..."
                />
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label>Prioridade</label>
                    <select
                        value={formData.priority}
                        onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                        style={{
                            borderLeft: `4px solid ${formData.priority === 'critical' ? '#ef4444' :
                                formData.priority === 'high' ? '#f97316' :
                                    formData.priority === 'medium' ? '#3b82f6' : '#10b981'
                                }`
                        }}
                    >
                        <option value="low">🟢 Baixa</option>
                        <option value="medium">🔵 Média</option>
                        <option value="high">🟠 Alta</option>
                        <option value="critical">🔴 Crítica</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Story Points (Esforço)</label>
                    <input
                        type="number"
                        min="0"
                        value={formData.storyPoints}
                        onChange={e => setFormData({ ...formData, storyPoints: parseInt(e.target.value) || 0 })}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Responsável</label>
                <select
                    value={formData.assignedTo}
                    onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                >
                    <option value="">Selecione um responsável</option>
                    {Array.isArray(users) && users.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                </select>
            </div>

            {task?.linkedTicket && (
                <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: '#f0f9ff',
                    borderRadius: '12px',
                    border: '1px solid #bae6fd',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <TicketIcon size={24} color="#0284c7" />
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>Ticket Vinculado</div>
                        <div style={{ fontSize: '15px', color: '#0c4a6e', fontWeight: 500 }}>
                            #{task.linkedTicket._id.slice(-6)} - {task.linkedTicket.title}
                        </div>
                    </div>
                </div>
            )}
        </BaseModal>
    );
};
