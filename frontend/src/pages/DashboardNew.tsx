import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services';
import { ticketService } from '../services/ticketService';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import './DashboardNew.css';

const COLORS = ['#2d6a4f', '#1b4332', '#52b788', '#d4a017', '#40916c'];

export const DashboardNew: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [kpis, setKpis] = useState<any>(null);
    const [myTickets, setMyTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadKPIs();
        if (user?._id) {
            loadMyTickets();
        }
    }, [user]);

    const loadKPIs = async () => {
        try {
            const response = await dashboardService.getKPIs();
            setKpis(response.data);
        } catch (error) {
            console.error('Erro ao carregar KPIs:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMyTickets = async () => {
        try {
            const response = await ticketService.getAll({ assignedTo: user?._id });
            const active = response.data.filter((t: any) => ['aberto', 'em_andamento'].includes(t.status));
            setMyTickets(active);
        } catch (error) {
            console.error('Erro ao carregar meus tickets:', error);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando dashboard...</p>
            </div>
        );
    }

    // Preparar dados para gráficos
    const ticketStatusData = kpis?.tickets?.byStatus?.map((item: any) => ({
        name: item._id,
        value: item.count
    })) || [];

    const ticketPriorityData = kpis?.tickets?.byPriority?.map((item: any) => ({
        name: item._id,
        value: item.count
    })) || [];

    const assetStatusData = kpis?.assets?.byStatus?.map((item: any) => ({
        name: item._id,
        value: item.count
    })) || [];

    return (
        <div className="dashboard-new">
            <div className="dashboard-header-new">
                <div>
                    <h1>{user?.role === 'admin' || user?.role === 'manager' ? 'Painel Industrial' : 'Dashboard'}</h1>
                    <p>Bem-vindo, {user?.name}!</p>
                </div>
                <div className="header-actions">
                    <span className="current-time">{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
            </div>

            {/* KPI Cards Indústria - PRIORIDADE */}
            <div className="section-header-new">
                <TrendingUp size={20} className="text-emerald-600" />
                <h3>Resumo Operacional (Abate & SIF)</h3>
            </div>
            
            <div className="kpi-grid-new mb-8">
                <div className="kpi-card-new industry-card">
                    <div className="kpi-icon-wrapper slaughter">
                        <TrendingUp size={32} />
                    </div>
                    <div className="kpi-content">
                        <h3>Abate do Mês</h3>
                        <p className="kpi-value-new">{kpis?.slaughter?.closedThisMonth || 0}</p>
                        <span className="kpi-trend positive">Total acumulado</span>
                    </div>
                </div>

                <div className="kpi-card-new industry-card">
                    <div className="kpi-icon-wrapper today">
                        <Clock size={32} />
                    </div>
                    <div className="kpi-content">
                        <h3>Escala Geral (Hoje)</h3>
                        <p className="kpi-value-new">{kpis?.slaughter?.todayPlanned || 0}</p>
                        <span className="kpi-trend neutral">Planejado</span>
                    </div>
                </div>

                <div className="kpi-card-new industry-card warning">
                    <div className="kpi-icon-wrapper sif">
                        <AlertTriangle size={32} />
                    </div>
                    <div className="kpi-content">
                        <h3>Pendências SIF</h3>
                        <p className="kpi-value-new">{kpis?.slaughter?.pendingClosures || 0}</p>
                        <span className="kpi-trend negative">Aguardando fechamento</span>
                    </div>
                </div>
            </div>

            {/* Gráficos de Indústria */}
            <div className="charts-grid mb-8">
                 <div className="chart-card industry-chart">
                    <h3>Distribuição por Categoria (Mês)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={kpis?.slaughter?.categoriesData || []}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {kpis?.slaughter?.categoriesData?.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Status das Solicitações</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={ticketStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {ticketStatusData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={['#10b981', '#f59e0b', '#3b82f6', '#ef4444'][index % 4]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="section-header-new">
                <CheckCircle size={20} className="text-slate-400" />
                <h3>Suporte & Administrativo</h3>
            </div>

            {/* KPI Cards Secundários */}
            <div className="kpi-grid-new secondary-grid">
                <div className="kpi-card-new mini">
                    <div className="kpi-content">
                        <h3>Ativos em Campo</h3>
                        <p className="kpi-value-new small">{kpis?.assets?.total || 0}</p>
                    </div>
                </div>
                <div className="kpi-card-new mini">
                    <div className="kpi-content">
                        <h3>Rotinas Atrasadas</h3>
                        <p className="kpi-value-new small">{kpis?.certificates?.critical || 0}</p>
                    </div>
                </div>
                <div className="kpi-card-new mini">
                    <div className="kpi-content">
                        <h3>Solicit. em Aberto</h3>
                        <p className="kpi-value-new small">{kpis?.tickets?.total || 0}</p>
                    </div>
                </div>
            </div>

            {/* Artigos Mais Vistos */}
            {kpis?.knowledgeBase?.topArticles && kpis.knowledgeBase.topArticles.length > 0 && (
                <div className="top-articles-section">
                    <h3>Procedimentos Mais Vistos</h3>
                    <div className="articles-list">
                        {kpis.knowledgeBase.topArticles.map((article: any, index: number) => (
                            <div key={article._id} className="article-item">
                                <span className="article-rank">#{index + 1}</span>
                                <div className="article-info">
                                    <h4>{article.title}</h4>
                                    <span className="article-category">{article.category}</span>
                                </div>
                                <span className="article-views">{article.views} visualizações</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
