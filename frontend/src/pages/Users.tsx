import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { Plus, Search, Edit, Trash2, Shield, User as UserIcon } from 'lucide-react';
import '../pages/Tickets.css';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'tecnico' | 'cliente';
    active: boolean;
    createdAt: string;
}

export const Users: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'cliente' as 'admin' | 'tecnico' | 'cliente',
        active: true
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await userService.getAll();
            setUsers(response.data);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = () => {
        setSelectedUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'cliente',
            active: true
        });
        setShowModal(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            active: user.active
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const dataToSend = { ...formData };
            if (!dataToSend.password) {
                delete (dataToSend as any).password;
            }

            if (selectedUser) {
                await userService.update(selectedUser._id, dataToSend);
            } else {
                await userService.create(dataToSend);
            }

            setShowModal(false);
            loadUsers();
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            alert('Erro ao salvar usuário. Verifique os dados e tente novamente.');
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Deseja realmente deletar este usuário?')) return;

        try {
            await userService.delete(id);
            loadUsers();
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            alert('Erro ao deletar usuário.');
        }
    };

    const handleToggleActive = async (id: string, active: boolean) => {
        try {
            await userService.toggleActive(id);
            loadUsers();
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            alert('Erro ao alterar status do usuário.');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadgeColor = (role: string) => {
        const colors: any = {
            admin: '#ef4444',
            tecnico: '#3b82f6',
            cliente: '#10b981'
        };
        return colors[role] || '#64748b';
    };

    const getRoleLabel = (role: string) => {
        const labels: any = {
            admin: 'Administrador',
            tecnico: 'Técnico',
            cliente: 'Cliente'
        };
        return labels[role] || role;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando usuários...</p>
            </div>
        );
    }

    return (
        <div className="tickets-page">
            <div className="page-header">
                <div>
                    <h1>Gerenciamento de Usuários</h1>
                    <p>{filteredUsers.length} usuário(s) cadastrado(s)</p>
                </div>
                <button className="btn-primary" onClick={handleCreateUser}>
                    <Plus size={20} />
                    Novo Usuário
                </button>
            </div>

            <div className="tickets-toolbar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="tickets-table-container">
                <table className="tickets-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Função</th>
                            <th>Status</th>
                            <th>Cadastrado em</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #2d6a4f, #1b4332)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            <UserIcon size={20} />
                                        </div>
                                        <strong>{user.name}</strong>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span
                                        className="priority-badge"
                                        style={{ backgroundColor: getRoleBadgeColor(user.role) }}
                                    >
                                        {getRoleLabel(user.role)}
                                    </span>
                                </td>
                                <td>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={user.active}
                                            onChange={() => handleToggleActive(user._id, !user.active)}
                                            disabled={user._id === (currentUser as any)?._id}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                    <span style={{ marginLeft: '8px', fontSize: '14px', color: user.active ? '#10b981' : '#64748b' }}>
                                        {user.active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleEditUser(user)}
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        {user._id !== (currentUser as any)?._id && (
                                            <button
                                                className="btn-icon danger"
                                                onClick={() => handleDeleteUser(user._id)}
                                                title="Deletar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>{selectedUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Nome Completo *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Nome do usuário"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        placeholder="email@exemplo.com"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Senha {selectedUser && '(deixe em branco para não alterar)'}</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!selectedUser}
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Função *</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                        required
                                    >
                                        <option value="cliente">Cliente</option>
                                        <option value="tecnico">Técnico</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={formData.active ? 'true' : 'false'}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                                    >
                                        <option value="true">Ativo</option>
                                        <option value="false">Inativo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {selectedUser ? 'Atualizar' : 'Criar Usuário'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: .4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #10b981;
        }

        input:checked + .slider:before {
          transform: translateX(24px);
        }

        input:disabled + .slider {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
        </div>
    );
};
