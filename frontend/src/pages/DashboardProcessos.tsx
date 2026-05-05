import React, { useState, useEffect } from 'react';
import { cicloProcessoService, fazendaService } from '../services';
import {
    Activity, Clock, CheckCircle2, AlertCircle,
    TrendingUp, User, Calendar, Filter,
    CheckSquare, Award, RefreshCw
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { toast } from 'react-toastify';
import './DashboardProcessos.css';

export const DashboardProcessos: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [rendimento, setRendimento] = useState<any[]>([]);
    const [ciclos, setCiclos] = useState<any[]>([]);
    const [fazendas, setFazendas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterFazenda, setFilterFazenda] = useState('');

    useEffect(() => {
        loadData();
    }, [filterFazenda]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filterFazenda) params.fazenda_id = filterFazenda;

            const [dashRes, rendRes, cicRes, fazRes] = await Promise.all([
                cicloProcessoService.getDashboard(params),
                cicloProcessoService.getRendimento(params),
                cicloProcessoService.getAll(params),
                fazendaService.getAll()
            ]);

            setDashboardData(dashRes.data);
            setRendimento(rendRes.data || []);
            setCiclos(cicRes.data || []);
            setFazendas(fazRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dashboard de processos:', error);
            toast.error('Erro ao carregar dados do dashboard');
        } finally {
            setLoading(false);
        }
    };

    const kpis = [
        { label: 'Processos Ativos', value: '12', icon: Activity, color: '#3b82f6' },
        { label: 'Ciclos no Mês', value: dashboardData?.kpis?.totalCiclos || '0', icon: RefreshCw, color: '#8b5cf6' },
        { label: 'Taxa de Conclusão', value: `${((dashboardData?.kpis?.totalConcluidos / dashboardData?.kpis?.totalCiclos) * 100 || 0).toFixed(1)}%`, icon: CheckCircle2, color: '#10b981' },
        { label: 'Tempo Médio', value: `${(dashboardData?.kpis?.tempoMedioDias || 0).toFixed(1)} dias`, icon: Clock, color: '#f59e0b' }
    ];

    return (
        <div className="processos-dashboard">
            <div className="page-header">
                <div>
                    <h1>Gestão de Processos</h1>
                    <p>Dashboard analítica de ciclos e rendimento</p>
                </div>
                <div className="filters">
                    <select value={filterFazenda} onChange={(e) => setFilterFazenda(e.target.value)}>
                        <option value="">Todas as Fazendas</option>
                        {fazendas.map(f => <option key={f._id} value={f._id}>{f.nome}</option>)}
                    </select>
                </div>
            </div>

            <div className="kpi-row">
                {kpis.map((kpi, i) => (
                    <div key={i} className="kpi-card">
                        <div className="icon" style={{ background: `${kpi.color}15`, color: kpi.color }}>
                            <kpi.icon size={24} />
                        </div>
                        <div className="details">
                            <span>{kpi.label}</span>
                            <h3>{kpi.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                {/* Histórico de Ciclos */}
                <div className="card chart-card">
                    <h3>Volume de Ciclos por Mês</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData?.porMes || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="ciclos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tempo Médio por Processo */}
                <div className="card chart-card">
                    <h3>Tempo Médio por Tipo de Processo (dias)</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={dashboardData?.tempoMedio || []}
                                layout="vertical"
                                margin={{ left: 40 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="processo.title" width={100} />
                                <Tooltip />
                                <Bar dataKey="media" fill="#10b981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Rendimento da Equipe */}
                <div className="card full-width">
                    <div className="section-header">
                        <h3>Rendimento da Equipe</h3>
                        <Award size={20} color="#f59e0b" />
                    </div>
                    <div className="worker-grid">
                        {rendimento.map(w => (
                            <div key={w._id} className="worker-card">
                                <div className="worker-info">
                                    <div className="worker-avatar">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h4>{w.usuario.name}</h4>
                                        <p>{w.ciclos} ciclos concluídos</p>
                                    </div>
                                </div>
                                <div className="worker-stats">
                                    <div className="stat">
                                        <label>Nota Média</label>
                                        <div className="stars">
                                            <span>{(w.notaMedia || 0).toFixed(1)}</span>
                                            <div className="star-bar">
                                                <div className="fill" style={{ width: `${(w.notaMedia || 0) * 20}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stat">
                                        <label>Velocidade</label>
                                        <strong>{(w.tempoMedio || 0).toFixed(1)} d/ciclo</strong>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabela de Ciclos Recentes */}
                <div className="card full-width">
                    <h3>Histórico de Ciclos Recentes</h3>
                    <table className="ciclos-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Processo</th>
                                <th>Responsável</th>
                                <th>Início</th>
                                <th>Fim</th>
                                <th>Duração</th>
                                <th>Status</th>
                                <th>Resultado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ciclos.map((c, i) => (
                                <tr key={c._id}>
                                    <td>{c.numero_ciclo}</td>
                                    <td><strong>{c.processo_id?.title}</strong></td>
                                    <td>{c.responsavel_id?.name}</td>
                                    <td>{new Date(c.data_inicio).toLocaleDateString()}</td>
                                    <td>{c.data_fim ? new Date(c.data_fim).toLocaleDateString() : '-'}</td>
                                    <td>{c.duracao_dias ? `${c.duracao_dias.toFixed(1)}d` : '-'}</td>
                                    <td><span className={`status-tag ${c.status}`}>{c.status}</span></td>
                                    <td><span className={`result-tag ${c.resultado}`}>{c.resultado}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
