import React, { useState, useEffect } from 'react';
import {
    RefreshCw, Plus, CheckCircle, Clock, AlertTriangle,
    Edit2, Trash2, Calendar, Filter, X, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import {
    cyclesService, processosService, processosUsersService,
    Cycle, ProcessItem
} from '../services/processosApi';
import './GestaoProcessos.css';

const SECTORS = [
    'Curral / Confinamento', 'Lavoura', 'Manutenção',
    'Veterinário', 'Administrativo', 'Almoxarifado',
    'Transporte', 'Portaria'
];

const CATEGORIES = [
    'Operacional', 'Administrativo', 'Manutenção', 'Segurança', 'Outro'
];

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pendente',
    COMPLETED: 'Concluído',
    OVERDUE: 'Atrasado'
};

const STATUS_COLORS: Record<string, string> = {
    PENDING: '#f59e0b',
    COMPLETED: '#10b981',
    OVERDUE: '#ef4444'
};

export const GestaoProcessos: React.FC = () => {
    const { user } = useAuth();
    const [cycle, setCycle] = useState<Cycle | null>(null);
    const [processes, setProcesses] = useState<ProcessItem[]>([]);
    const [users, setUsers] = useState<Array<{ _id: string; name: string; role: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [sectorFilter, setSectorFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeliverModal, setShowDeliverModal] = useState<string | null>(null);
    const [showCycleModal, setShowCycleModal] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '', description: '', sector: SECTORS[0],
        category: CATEGORIES[0], responsible: '', deadline: ''
    });

    const [deliverData, setDeliverData] = useState({
        deliveredAt: new Date().toISOString().split('T')[0],
        evidence: ''
    });

    const [cycleForm, setCycleForm] = useState({
        name: '', startDate: '', endDate: ''
    });

    useEffect(() => {
        loadData();
    }, [sectorFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [cycleRes, usersRes] = await Promise.all([
                cyclesService.getCurrent().catch(() => ({ data: { success: false, data: null } })),
                processosUsersService.list().catch(() => ({ data: { success: false, data: [] } }))
            ]);
            setCycle(cycleRes.data?.data || null);
            setUsers(usersRes.data?.data || []);

            const currentCycle = cycleRes.data?.data;
            if (currentCycle?._id) {
                const processRes = await processosService.list(currentCycle._id, sectorFilter || undefined);
                setProcesses(processRes.data?.data || []);
            } else {
                setProcesses([]);
            }
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProcess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cycle) return;
        try {
            await processosService.create({ ...formData, cycleId: cycle._id });
            setShowCreateModal(false);
            setFormData({ title: '', description: '', sector: SECTORS[0], category: CATEGORIES[0], responsible: '', deadline: '' });
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao criar rotina');
        }
    };

    const handleDeliver = async (id: string) => {
        try {
            await processosService.deliver(id, deliverData);
            setShowDeliverModal(null);
            setDeliverData({ deliveredAt: new Date().toISOString().split('T')[0], evidence: '' });
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao entregar processo');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Deseja excluir esta rotina?')) return;
        try {
            await processosService.delete(id);
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao excluir');
        }
    };

    const handleCreateCycle = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await cyclesService.create(cycleForm);
            setShowCycleModal(false);
            setCycleForm({ name: '', startDate: '', endDate: '' });
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao criar ciclo');
        }
    };

    const handleCloseCycle = async () => {
        if (!cycle || !window.confirm('Deseja fechar o ciclo atual?')) return;
        try {
            await cyclesService.close(cycle._id);
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao fechar ciclo');
        }
    };

    const canManage = user?.role === 'admin' || user?.role === 'manager';
    const totalProcesses = processes.length;
    const completedCount = processes.filter(p => p.status === 'COMPLETED').length;
    const overdueCount = processes.filter(p => p.status === 'OVERDUE').length;
    const onTimePercent = totalProcesses > 0 ? Math.round((completedCount / totalProcesses) * 100) : 0;

    if (loading) {
        return (
            <div className="processos-loading">
                <div className="processos-spinner" />
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="processos-page">
            <div className="processos-header">
                <div>
                    <h1>Gestão de Processos</h1>
                    <p>Controle de rotinas, prazos e entregas</p>
                </div>
                <div className="processos-header-actions">
                    {canManage && !cycle && (
                        <button className="btn-accent" onClick={() => setShowCycleModal(true)}>
                            <Calendar size={18} /> Abrir Ciclo
                        </button>
                    )}
                    {canManage && cycle && (
                        <>
                            <button className="btn-accent" onClick={() => setShowCreateModal(true)}>
                                <Plus size={18} /> Nova Rotina
                            </button>
                            <button className="btn-outline-danger" onClick={handleCloseCycle}>
                                Fechar Ciclo
                            </button>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="processos-error">
                    <AlertTriangle size={16} /> {error}
                    <button onClick={() => setError('')}><X size={14} /></button>
                </div>
            )}

            {/* Ciclo Ativo */}
            {cycle ? (
                <div className="cycle-bar">
                    <div className="cycle-info">
                        <RefreshCw size={20} />
                        <div>
                            <strong>{cycle.name}</strong>
                            <span>
                                {cycle.startDate ? new Date(cycle.startDate).toLocaleDateString('pt-BR') : '...'} — {cycle.endDate ? new Date(cycle.endDate).toLocaleDateString('pt-BR') : 'Em andamento'}
                            </span>
                        </div>
                    </div>
                    <div className="cycle-kpis">
                        <div className="cycle-kpi">
                            <span className="cycle-kpi-value">{totalProcesses}</span>
                            <span className="cycle-kpi-label">Total</span>
                        </div>
                        <div className="cycle-kpi">
                            <span className="cycle-kpi-value" style={{ color: '#10b981' }}>{onTimePercent}%</span>
                            <span className="cycle-kpi-label">No Prazo</span>
                        </div>
                        <div className="cycle-kpi">
                            <span className="cycle-kpi-value" style={{ color: '#ef4444' }}>{overdueCount}</span>
                            <span className="cycle-kpi-label">Atrasados</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="no-cycle-banner">
                    <Calendar size={32} />
                    <h3>Nenhum ciclo ativo</h3>
                    <p>Abra um novo ciclo para começar a gerenciar rotinas e processos.</p>
                </div>
            )}

            {/* Filtro de Setor */}
            {cycle && (
                <div className="processos-toolbar">
                    <div className="sector-filter">
                        <Filter size={16} />
                        <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
                            <option value="">Todos os Setores</option>
                            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={14} className="filter-chevron" />
                    </div>
                </div>
            )}

            {/* Lista de Processos */}
            {cycle && (
                <div className="processos-table-container">
                    {processes.length === 0 ? (
                        <div className="processos-empty">
                            <RefreshCw size={40} />
                            <h3>Nenhuma rotina encontrada</h3>
                            <p>{sectorFilter ? 'Tente outro setor ou limpe o filtro.' : 'Adicione uma nova rotina para começar.'}</p>
                        </div>
                    ) : (
                        <table className="processos-table">
                            <thead>
                                <tr>
                                    <th>Rotina</th>
                                    <th>Setor</th>
                                    <th>Categoria</th>
                                    <th>Responsável</th>
                                    <th>Prazo</th>
                                    <th>Status</th>
                                    <th>Nota</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processes.map(process => (
                                    <tr key={process._id}>
                                        <td>
                                            <div className="process-title-cell">
                                                <strong>{process.title}</strong>
                                                {process.description && <span>{process.description}</span>}
                                            </div>
                                        </td>
                                        <td><span className="sector-badge">{process.sector}</span></td>
                                        <td><span className="category-badge">{process.category || 'Operacional'}</span></td>
                                        <td>
                                            <span style={{ fontSize: '14px', color: '#475569' }}>
                                                {process.responsibleName || (typeof process.responsible === 'object' ? (process.responsible as any)?.name : process.responsible) || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#475569' }}>
                                                <Calendar size={14} color="#64748b" />
                                                {new Date(process.deadline).toLocaleDateString('pt-BR')}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="status-pill" style={{ background: STATUS_COLORS[process.status] }}>
                                                {STATUS_LABELS[process.status]}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`score-badge ${(process.score || 0) >= 8 ? 'good' : (process.score || 0) >= 5 ? 'medium' : 'low'}`}>
                                                {typeof process.score === 'number' ? process.score.toFixed(1) : '—'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="process-actions">
                                                {process.status !== 'COMPLETED' && (
                                                    <button className="btn-icon-sm success" title="Entregar" onClick={() => setShowDeliverModal(process._id)}>
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                {canManage && (
                                                    <button className="btn-icon-sm danger" title="Excluir" onClick={() => handleDelete(process._id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Modal Criar Rotina */}
            {showCreateModal && (
                <div className="processos-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="processos-modal" onClick={e => e.stopPropagation()}>
                        <div className="processos-modal-header">
                            <h2>Nova Rotina</h2>
                            <button onClick={() => setShowCreateModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateProcess}>
                            <div className="processos-modal-body">
                                <div className="form-group">
                                    <label>Título</label>
                                    <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Vacinação do lote 3" />
                                </div>
                                <div className="form-group">
                                    <label>Descrição</label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Detalhes da rotina..." />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Setor</label>
                                        <select value={formData.sector} onChange={e => setFormData({ ...formData, sector: e.target.value })}>
                                            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Categoria</label>
                                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Responsável</label>
                                        <select value={formData.responsible} onChange={e => setFormData({ ...formData, responsible: e.target.value })}>
                                            <option value="">Selecione...</option>
                                            {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Prazo</label>
                                    <input type="date" required value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                                </div>
                            </div>
                            <div className="processos-modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-accent">Criar Rotina</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Entregar Processo */}
            {showDeliverModal && (
                <div className="processos-modal-overlay" onClick={() => setShowDeliverModal(null)}>
                    <div className="processos-modal" onClick={e => e.stopPropagation()}>
                        <div className="processos-modal-header">
                            <h2>Entregar Rotina</h2>
                            <button onClick={() => setShowDeliverModal(null)}><X size={20} /></button>
                        </div>
                        <div className="processos-modal-body">
                            <div className="form-group">
                                <label>Data de Entrega</label>
                                <input type="date" value={deliverData.deliveredAt} onChange={e => setDeliverData({ ...deliverData, deliveredAt: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Evidência / Observação</label>
                                <textarea value={deliverData.evidence} onChange={e => setDeliverData({ ...deliverData, evidence: e.target.value })} placeholder="Descreva o que foi feito..." />
                            </div>
                        </div>
                        <div className="processos-modal-footer">
                            <button className="btn-secondary" onClick={() => setShowDeliverModal(null)}>Cancelar</button>
                            <button className="btn-accent" onClick={() => handleDeliver(showDeliverModal)}>Confirmar Entrega</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Abrir Ciclo */}
            {showCycleModal && (
                <div className="processos-modal-overlay" onClick={() => setShowCycleModal(false)}>
                    <div className="processos-modal" onClick={e => e.stopPropagation()}>
                        <div className="processos-modal-header">
                            <h2>Abrir Novo Ciclo</h2>
                            <button onClick={() => setShowCycleModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateCycle}>
                            <div className="processos-modal-body">
                                <div className="form-group">
                                    <label>Nome do Ciclo</label>
                                    <input type="text" required value={cycleForm.name} onChange={e => setCycleForm({ ...cycleForm, name: e.target.value })} placeholder="Ex: Março 2026" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Início</label>
                                        <input type="date" required value={cycleForm.startDate} onChange={e => setCycleForm({ ...cycleForm, startDate: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Fim</label>
                                        <input type="date" required value={cycleForm.endDate} onChange={e => setCycleForm({ ...cycleForm, endDate: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="processos-modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowCycleModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-accent">Abrir Ciclo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
