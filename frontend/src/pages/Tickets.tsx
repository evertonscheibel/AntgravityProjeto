import React, { useEffect, useState } from 'react';
import { ticketService, Ticket } from '../services/ticketService';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    MessageSquare,
    Paperclip,
    X
} from 'lucide-react';
import { TicketModal } from '../components/TicketModal';
import './Tickets.css';

export const Tickets: React.FC = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

    useEffect(() => {
        loadTickets();
    }, [filterStatus, filterPriority]);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterStatus) params.status = filterStatus;
            if (filterPriority) params.priority = filterPriority;

            const response = await ticketService.getAll(params);
            setTickets(response.data);
        } catch (error) {
            console.error('Erro ao carregar tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = () => {
        setSelectedTicket(null);
        setShowModal(true);
    };

    const handleEditTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowModal(true);
    };

    const handleDeleteTicket = async (id: string) => {
        if (!window.confirm('Deseja realmente deletar este ticket?')) return;

        try {
            await ticketService.delete(id);
            loadTickets();
        } catch (error) {
            console.error('Erro ao deletar ticket:', error);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedTicket(null);
        loadTickets();
    };

    const filteredTickets = tickets.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPriorityColor = (priority: string) => {
        const colors: any = {
            baixa: '#10b981',
            media: '#f59e0b',
            alta: '#ef4444',
            critica: '#9333ea'
        };
        return colors[priority] || '#64748b';
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            aberto: '#3b82f6',
            em_andamento: '#f59e0b',
            resolvido: '#10b981',
            fechado: '#64748b'
        };
        return colors[status] || '#64748b';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando tickets...</p>
            </div>
        );
    }

    return (
        <div className="tickets-page">
            <div className="page-header">
                <div>
                    <h1>Gestão de Tickets</h1>
                    <p>{filteredTickets.length} ticket(s) encontrado(s)</p>
                </div>
                <button className="btn-primary" onClick={handleCreateTicket}>
                    <Plus size={20} />
                    Novo Ticket
                </button>
            </div>

            <div className="tickets-toolbar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filters">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todos os Status</option>
                        <option value="aberto">Aberto</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="resolvido">Resolvido</option>
                        <option value="fechado">Fechado</option>
                    </select>

                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todas as Prioridades</option>
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                        <option value="critica">Crítica</option>
                    </select>

                    <div className="view-toggle">
                        <button
                            className={viewMode === 'list' ? 'active' : ''}
                            onClick={() => setViewMode('list')}
                        >
                            Lista
                        </button>
                        <button
                            className={viewMode === 'kanban' ? 'active' : ''}
                            onClick={() => setViewMode('kanban')}
                        >
                            Kanban
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="tickets-table-container">
                    <table className="tickets-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Título</th>
                                <th>Categoria</th>
                                <th>Prioridade</th>
                                <th>Status</th>
                                <th>Solicitante</th>
                                <th>Responsável</th>
                                <th>Criado em</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTickets.map((ticket) => (
                                <tr key={ticket._id}>
                                    <td>#{ticket._id.slice(-6)}</td>
                                    <td>
                                        <div className="ticket-title-cell">
                                            <strong>{ticket.title}</strong>
                                            {ticket.comments.length > 0 && (
                                                <span className="comment-badge">
                                                    <MessageSquare size={14} />
                                                    {ticket.comments.length}
                                                </span>
                                            )}
                                            {ticket.attachments.length > 0 && (
                                                <span className="attachment-badge">
                                                    <Paperclip size={14} />
                                                    {ticket.attachments.length}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="category-badge">{ticket.category}</span>
                                    </td>
                                    <td>
                                        <span
                                            className="priority-badge"
                                            style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                                        >
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(ticket.status) }}
                                        >
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>{ticket.requester?.name || 'N/A'}</td>
                                    <td>{ticket.assignedTo?.name || 'Não atribuído'}</td>
                                    <td>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleEditTicket(ticket)}
                                                title="Ver detalhes"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {(user?.role === 'admin' || user?.role === 'tecnico') && (
                                                <>
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => handleEditTicket(ticket)}
                                                        title="Editar"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    {user?.role === 'admin' && (
                                                        <button
                                                            className="btn-icon danger"
                                                            onClick={() => handleDeleteTicket(ticket._id)}
                                                            title="Deletar"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredTickets.length === 0 && (
                        <div className="empty-state">
                            <p>Nenhum ticket encontrado</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="kanban-board">
                    {['aberto', 'em_andamento', 'resolvido', 'fechado'].map((status) => (
                        <div key={status} className="kanban-column">
                            <div className="kanban-header">
                                <h3>{status.replace('_', ' ')}</h3>
                                <span className="kanban-count">
                                    {filteredTickets.filter(t => t.status === status).length}
                                </span>
                            </div>
                            <div className="kanban-cards">
                                {filteredTickets
                                    .filter(t => t.status === status)
                                    .map((ticket) => (
                                        <div
                                            key={ticket._id}
                                            className="kanban-card"
                                            onClick={() => handleEditTicket(ticket)}
                                        >
                                            <div className="kanban-card-header">
                                                <span className="ticket-id">#{ticket._id.slice(-6)}</span>
                                                <span
                                                    className="priority-dot"
                                                    style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                                                />
                                            </div>
                                            <h4>{ticket.title}</h4>
                                            <p>{ticket.description.substring(0, 100)}...</p>
                                            <div className="kanban-card-footer">
                                                <span className="category-badge">{ticket.category}</span>
                                                {ticket.assignedTo && (
                                                    <span className="assigned-to">{ticket.assignedTo.name}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <TicketModal
                    ticket={selectedTicket}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};
