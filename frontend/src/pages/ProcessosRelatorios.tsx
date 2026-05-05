import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Clock } from 'lucide-react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import { processosReportsService, cyclesService, ProcessosSummary, Cycle } from '../services/processosApi';
import './GestaoProcessos.css';

const CHART_COLORS = ['#2d6a4f', '#52b788', '#d4a017', '#ef4444', '#40916c'];

const SECTORS = [
    'Curral / Confinamento', 'Lavoura', 'Manutenção',
    'Veterinário', 'Administrativo', 'Almoxarifado',
    'Transporte', 'Portaria'
];

const CATEGORIES = [
    'Operacional', 'Administrativo', 'Manutenção', 'Segurança', 'Outro'
];

export const ProcessosRelatorios: React.FC = () => {
    const [summary, setSummary] = useState<ProcessosSummary | null>(null);
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [selectedCycleId, setSelectedCycleId] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCycles();
    }, []);

    useEffect(() => {
        loadSummary();
    }, [selectedCycleId, selectedSector, selectedCategory]);

    const loadCycles = async () => {
        try {
            const res = await cyclesService.list();
            setCycles(res.data || []);
        } catch (err) {
            console.error('Erro ao carregar ciclos:', err);
        }
    };

    const loadSummary = async () => {
        setLoading(true);
        try {
            const res = await processosReportsService.getSummary({
                cycleId: selectedCycleId || undefined,
                sector: selectedSector || undefined,
                category: selectedCategory || undefined
            });
            setSummary(res.data);
        } catch (err) {
            console.error('Erro ao carregar relatórios:', err);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="processos-loading">
                <div className="processos-spinner" />
                <p>Carregando relatórios...</p>
            </div>
        );
    }

    const statusData = summary?.byStatus?.map(s => ({
        name: s._id === 'concluido' ? 'Concluído' :
            s._id === 'atrasado' ? 'Atrasado' :
                s._id === 'em_andamento' ? 'Em Andamento' : 'Pendente',
        value: s.count
    })) || [];

    const sectorData = summary?.bySector?.map(s => ({
        name: s._id || 'Sem Setor',
        score: Number(s.avgScore?.toFixed(1)) || 0,
        count: s.count
    })) || [];

    return (
        <div className="processos-page">
            <div className="processos-header">
                <div>
                    <h1>Relatórios de Processos</h1>
                    <p>Indicadores de performance e acompanhamento</p>
                </div>
                <div className="processos-header-actions">
                    <select
                        className="cycle-select"
                        value={selectedCycleId}
                        onChange={e => setSelectedCycleId(e.target.value)}
                    >
                        <option value="">Todos os Ciclos</option>
                        {cycles.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>

                    <select
                        className="cycle-select"
                        value={selectedSector}
                        onChange={e => setSelectedSector(e.target.value)}
                    >
                        <option value="">Todos os Setores</option>
                        {SECTORS.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    <select
                        className="cycle-select"
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Todas as Categorias</option>
                        {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {!summary ? (
                <div className="processos-empty">
                    <BarChart3 size={40} />
                    <h3>Sem dados disponíveis</h3>
                    <p>Crie processos e ciclos para visualizar os relatórios.</p>
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="report-kpis">
                        <div className="report-kpi-card">
                            <TrendingUp size={24} />
                            <div>
                                <span className="report-kpi-value">{summary.averageScore?.toFixed(1) || '0.0'}</span>
                                <span className="report-kpi-label">Nota Média</span>
                            </div>
                        </div>
                        <div className="report-kpi-card">
                            <Clock size={24} />
                            <div>
                                <span className="report-kpi-value">{summary.onTimePercentage || 0}%</span>
                                <span className="report-kpi-label">No Prazo</span>
                            </div>
                        </div>
                        <div className="report-kpi-card warning">
                            <PieChartIcon size={24} />
                            <div>
                                <span className="report-kpi-value">{summary.overdue || 0}</span>
                                <span className="report-kpi-label">Atrasados</span>
                            </div>
                        </div>
                        <div className="report-kpi-card success">
                            <BarChart3 size={24} />
                            <div>
                                <span className="report-kpi-value">{summary.completed || 0}/{summary.totalProcesses || 0}</span>
                                <span className="report-kpi-label">Concluídos</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="report-charts">
                        <div className="report-chart-card">
                            <h3>Status dos Processos</h3>
                            {statusData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {statusData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="chart-empty">Sem dados</p>
                            )}
                        </div>

                        <div className="report-chart-card">
                            <h3>Nota Média por Setor</h3>
                            {sectorData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={sectorData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 10]} />
                                        <Tooltip />
                                        <Bar dataKey="score" fill="#2d6a4f" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="chart-empty">Sem dados</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
