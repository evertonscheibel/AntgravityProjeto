import React, { useState, useEffect } from 'react';
import { custosService, fazendaService } from '../services';
import {
    Plus, Search, Filter, DollarSign,
    TrendingUp, BarChart3, PieChart, Info,
    ArrowUpRight, ArrowDownRight, Calendar
} from 'lucide-react';
import {
    PieChart as RePieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { LancamentoCustoModal } from '../components/LancamentoCustoModal';
import { toast } from 'react-toastify';
import './Custos.css';

export const Custos: React.FC = () => {
    const [lancamentos, setLancamentos] = useState<any[]>([]);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [fazendas, setFazendas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterFazenda, setFilterFazenda] = useState('');
    const [filterSafra, setFilterSafra] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [selectedLancamento, setSelectedLancamento] = useState<any | null>(null);

    useEffect(() => {
        loadData();
    }, [filterFazenda, filterSafra]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filterFazenda) params.fazenda_id = filterFazenda;
            if (filterSafra) params.safra_id = filterSafra;

            const [dashRes, lancRes, fazRes] = await Promise.all([
                custosService.getDashboard(params),
                custosService.getLancamentos(params),
                fazendaService.getAll()
            ]);

            setDashboardData(dashRes.data);
            setLancamentos(lancRes.data || []);
            setFazendas(fazRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar custos:', error);
            toast.error('Erro ao carregar dados de custos');
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="custos-page">
            <div className="page-header">
                <div>
                    <h1>Gestão de Custos</h1>
                    <p>Controle financeiro operacional das fazendas</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary">
                        <BarChart3 size={20} /> Orçamento de Safra
                    </button>
                    <button className="btn-primary" onClick={() => { setSelectedLancamento(null); setShowModal(true); }}>
                        <Plus size={20} /> Novo Lançamento
                    </button>
                </div>
            </div>

            <div className="filters-bar">
                <div className="filter-group">
                    <label><Filter size={16} /> Fazenda</label>
                    <select value={filterFazenda} onChange={(e) => setFilterFazenda(e.target.value)}>
                        <option value="">Todas as Fazendas</option>
                        {fazendas.map(f => (
                            <option key={f._id} value={f._id}>{f.nome}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label><Calendar size={16} /> Safra</label>
                    <select value={filterSafra} onChange={(e) => setFilterSafra(e.target.value)}>
                        <option value="">Todas as Safras</option>
                        {/* Mocking Safras for now or adding safraService eventually */}
                        <option value="24/25">Soja 24/25</option>
                        <option value="25">Milho 25</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Carregando...</div>
            ) : (
                <>
                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <div className="kpi-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                                <DollarSign size={24} />
                            </div>
                            <div className="kpi-info">
                                <span>Custo Total</span>
                                <h3>{formatCurrency(dashboardData?.custoTotal || 0)}</h3>
                                <small className="positive"><ArrowUpRight size={14} /> 12% vs mês ant.</small>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}>
                                <TrendingUp size={24} />
                            </div>
                            <div className="kpi-info">
                                <span>Custo / ha</span>
                                <h3>{formatCurrency((dashboardData?.custoTotal || 0) / 120)}/ha</h3>
                                <small>Ref: 120 ha ativos</small>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                                <BarChart3 size={24} />
                            </div>
                            <div className="kpi-info">
                                <span>% do Orçado</span>
                                <h3>87%</h3>
                                <div className="progress-bar">
                                    <div className="progress" style={{ width: '87%', background: '#f59e0b' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon" style={{ background: '#faf5ff', color: '#a855f7' }}>
                                <Info size={24} />
                            </div>
                            <div className="kpi-info">
                                <span>Resultado Proj.</span>
                                <h3>{formatCurrency(41200)}</h3>
                                <small className="positive">Lucro estimado</small>
                            </div>
                        </div>
                    </div>

                    <div className="charts-grid">
                        <div className="chart-container card">
                            <h3>Custo por Categoria</h3>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={dashboardData?.custoPorCategoria || []}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="total"
                                            nameKey="_id"
                                        >
                                            {(dashboardData?.custoPorCategoria || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ReTooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                        />
                                        <Legend />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="chart-container card">
                            <h3>Custo por Talhão</h3>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dashboardData?.custoPorTalhao || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="talhao.nome" />
                                        <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} />
                                        <ReTooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="lancamentos-section card">
                        <div className="section-header">
                            <h3>Lançamentos Recentes</h3>
                            <div className="search-box-mini">
                                <Search size={16} />
                                <input type="text" placeholder="Filtrar lançamentos..." />
                            </div>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Descrição</th>
                                    <th>Categoria</th>
                                    <th>Centro de Custo</th>
                                    <th className="text-right">Valor</th>
                                    <th>Origem</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lancamentos.map(l => (
                                    <tr key={l._id}>
                                        <td>{new Date(l.data).toLocaleDateString()}</td>
                                        <td>
                                            <div className="desc-cell">
                                                <strong>{l.descricao}</strong>
                                                <small>{l.fornecedor_id?.nome_fantasia || 'Sem fornecedor'}</small>
                                            </div>
                                        </td>
                                        <td><span className="cat-badge">{l.categoria.replace('_', ' ')}</span></td>
                                        <td>{l.centro_custo_id?.nome}</td>
                                        <td className="text-right"><strong>{formatCurrency(l.valor)}</strong></td>
                                        <td><span className="origin-badge">{l.origem}</span></td>
                                        <td>
                                            <span className={`status-dot ${l.aprovado ? 'approved' : 'pending'}`}></span>
                                            {l.aprovado ? 'Aprovado' : 'Pendente'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {showModal && (
                <LancamentoCustoModal
                    lancamento={selectedLancamento}
                    onClose={() => setShowModal(false)}
                    onSave={() => loadData()}
                />
            )}
        </div>
    );
};
