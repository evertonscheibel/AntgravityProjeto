import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { cyclesService, processosService, Cycle, ProcessItem } from '../services/processosApi';
import './GestaoProcessos.css';

export const CiclosHistorico: React.FC = () => {
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [expandedCycle, setExpandedCycle] = useState<string | null>(null);
    const [cycleProcesses, setCycleProcesses] = useState<Record<string, ProcessItem[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCycles();
    }, []);

    const loadCycles = async () => {
        try {
            const res = await cyclesService.list();
            const closedCycles = (res.data || []).filter(c => c.status === 'fechado');
            setCycles(closedCycles);
        } catch (err) {
            console.error('Erro ao carregar ciclos:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleCycle = async (cycleId: string) => {
        if (expandedCycle === cycleId) {
            setExpandedCycle(null);
            return;
        }
        setExpandedCycle(cycleId);
        if (!cycleProcesses[cycleId]) {
            try {
                const res = await processosService.list(cycleId);
                setCycleProcesses(prev => ({ ...prev, [cycleId]: res.data || [] }));
            } catch (err) {
                console.error('Erro ao carregar processos do ciclo:', err);
            }
        }
    };

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
                    <h1>Histórico de Ciclos</h1>
                    <p>Ciclos encerrados e seus processos</p>
                </div>
            </div>

            {cycles.length === 0 ? (
                <div className="processos-empty">
                    <Calendar size={40} />
                    <h3>Nenhum ciclo encerrado</h3>
                    <p>Os ciclos finalizados aparecerão aqui.</p>
                </div>
            ) : (
                <div className="cycles-list">
                    {cycles.map(cycle => {
                        const procs = cycleProcesses[cycle._id] || [];
                        const completed = procs.filter(p => p.status === 'concluido').length;
                        const total = procs.length;
                        const isExpanded = expandedCycle === cycle._id;

                        return (
                            <div key={cycle._id} className={`cycle-card ${isExpanded ? 'expanded' : ''}`}>
                                <div className="cycle-card-header" onClick={() => toggleCycle(cycle._id)}>
                                    <div className="cycle-card-info">
                                        <RefreshCw size={18} />
                                        <div>
                                            <strong>{cycle.name}</strong>
                                            <span>
                                                {new Date(cycle.startDate).toLocaleDateString('pt-BR')} — {new Date(cycle.endDate).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="cycle-card-right">
                                        {total > 0 && (
                                            <span className="cycle-card-score">
                                                {completed}/{total} concluídos
                                            </span>
                                        )}
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="cycle-card-body">
                                        {procs.length === 0 ? (
                                            <p className="cycle-no-items">Nenhum processo neste ciclo.</p>
                                        ) : (
                                            <table className="processos-table compact">
                                                <thead>
                                                    <tr>
                                                        <th>Rotina</th>
                                                        <th>Setor</th>
                                                        <th>Status</th>
                                                        <th>Nota</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {procs.map(p => (
                                                        <tr key={p._id}>
                                                            <td>{p.title}</td>
                                                            <td><span className="sector-badge">{p.sector}</span></td>
                                                            <td>
                                                                <span className="status-pill" style={{
                                                                    background: p.status === 'concluido' ? '#10b981' :
                                                                        p.status === 'atrasado' ? '#ef4444' :
                                                                            p.status === 'em_andamento' ? '#3b82f6' : '#f59e0b'
                                                                }}>
                                                                    {p.status === 'concluido' ? 'Concluído' :
                                                                        p.status === 'atrasado' ? 'Atrasado' :
                                                                            p.status === 'em_andamento' ? 'Em Andamento' : 'Pendente'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`score-badge ${p.score >= 8 ? 'good' : p.score >= 5 ? 'medium' : 'low'}`}>
                                                                    {p.score.toFixed(1)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
