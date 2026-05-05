import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ticketService, Ticket } from '../services/ticketService';
import { projectService } from '../services/projectService';
import { userService, User } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { Upload, File, Trash2, Send } from 'lucide-react';
import BaseModal from './BaseModal';
import './TicketModal.css';

interface TicketModalProps {
    ticket: Ticket | null;
    onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ ticket, onClose }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: ticket?.title || '',
        description: ticket?.description || '',
        category: ticket?.category || 'outros',
        priority: ticket?.priority || 'media',
        status: ticket?.status || 'aberto',
        assignedTo: ticket?.assignedTo?._id || ''
    });
    const [users, setUsers] = useState<User[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await userService.getAll();
                setUsers(response.data || response); // Handle variations in API response
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
            }
        };
        fetchUsers();
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: 5242880,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc', '.docx'],
            'text/*': ['.txt']
        }
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const validate = () => {
        const newErrors: any = {};
        if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
        if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
        if (!formData.category) newErrors.category = 'Selecione uma categoria';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            const dataToSend: any = { ...formData };
            if (!dataToSend.assignedTo) delete dataToSend.assignedTo;

            if (ticket) {
                await ticketService.update(ticket._id, dataToSend);
            } else {
                await ticketService.create(dataToSend);
            }

            onClose();
            window.location.reload();
        } catch (error: any) {
            console.error('Erro ao salvar ticket:', error);
            alert(`Erro ao salvar ticket: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !ticket) return;
        try {
            await ticketService.addComment(ticket._id, newComment);
            setNewComment('');
            window.location.reload();
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
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
                {loading ? 'Salvando...' : ticket ? 'Atualizar Ticket' : 'Criar Ticket'}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title={ticket ? 'Editar Ticket' : 'Novo Ticket'}
            footer={modalFooter}
        >
            <div className="form-group">
                <label className="required">Título</label>
                <input
                    type="text"
                    className={errors.title ? 'field-error' : ''}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Resumo do problema..."
                />
                {errors.title && <span className="error-msg">{errors.title}</span>}
            </div>

            <div className="form-group">
                <label className="required">Descrição</label>
                <textarea
                    className={errors.description ? 'field-error' : ''}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Detalhes sobre a solicitação..."
                />
                {errors.description && <span className="error-msg">{errors.description}</span>}
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label className="required">Categoria</label>
                    <select
                        className={errors.category ? 'field-error' : ''}
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="manejo_agro">Manejo Agrícola</option>
                        <option value="maquinario">Maquinário / Peças</option>
                        <option value="insumos">Insumos / Estoque</option>
                        <option value="infraestrutura">Infraestrutura</option>
                        <option value="financeiro">Financeiro / Compras</option>
                        <option value="rh">RH / Pessoal</option>
                        <option value="outros">Outros</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="required">Prioridade</label>
                    <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    >
                        <option value="baixa">🟢 Baixa</option>
                        <option value="media">🟡 Média</option>
                        <option value="alta">🟠 Alta</option>
                        <option value="critica">🔴 Crítica</option>
                    </select>
                </div>
            </div>

            {(user?.role === 'admin' || user?.role === 'tecnico') && (
                <div className="form-row-2">
                    <div className="form-group">
                        <label>Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        >
                            <option value="aberto">Aberto</option>
                            <option value="em_andamento">Em Andamento</option>
                            <option value="resolvido">Resolvido</option>
                            <option value="fechado">Fechado</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Responsável</label>
                        <select
                            value={formData.assignedTo}
                            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        >
                            <option value="">Selecionar responsável...</option>
                            {users.map(u => (
                                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="form-group">
                <label>Anexos</label>
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                    <input {...getInputProps()} />
                    <Upload size={32} />
                    <p>Arraste arquivos ou clique para selecionar</p>
                </div>

                {files.length > 0 && (
                    <div className="files-list">
                        {files.map((file, index) => (
                            <div key={index} className="file-item">
                                <span className="file-name">{file.name}</span>
                                <button type="button" className="remove-file-btn" onClick={() => removeFile(index)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {ticket && (
                <div className="comments-section">
                    <h3>Comentários ({ticket.comments.length})</h3>
                    <div className="comments-list">
                        {ticket.comments.map((comment: any, index: number) => (
                            <div key={index} className="comment-item">
                                <div className="comment-header">
                                    <strong>{comment.user?.name}</strong>
                                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p>{comment.comment}</p>
                            </div>
                        ))}
                    </div>
                    <div className="add-comment">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Adicionar atualização..."
                        />
                        <button type="button" className="btn-send-comment" onClick={handleAddComment}>
                            <Send size={18} /> Enviar
                        </button>
                    </div>
                </div>
            )}
        </BaseModal>
    );
};
