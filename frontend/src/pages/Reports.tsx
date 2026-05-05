import React, { useEffect, useState } from 'react';
import { assetService, maintenanceService, dashboardService } from '../services';
import { BarChart3, PieChart, TrendingUp, DollarSign, AlertCircle, Calendar } from 'lucide-react';
import './Tickets.css';

export const Reports: React.FC = () => {
    const [assetReport, setAssetReport] = useState<any>(null);
    const [maintenanceStats, setMaintenanceStats] = useState<any>(null);
    const [maintenanceReport, setMaintenanceReport] = useState<any>(null);
    const [operationalData, setOperationalData] = useState<any>(null);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30');

    useEffect(() => {
        loadReports();
    }, [period]);

    const loadReports = async () => {
        try {
            const [assetRes, maintenanceStatsRes, maintenanceReportRes, operationalRes, alertsRes] = await Promise.all([
                assetService.getReport(),
                maintenanceService.getStats(),
                maintenanceService.getReport(period),
                dashboardService.getOperational(),
                dashboardService.getAlerts()
            ]);

            setAssetReport(assetRes.data);
            setMaintenanceStats(maintenanceStatsRes.data);
            setMaintenanceReport(maintenanceReportRes.data);
            setOperationalData(operationalRes.data);
            setAlerts(alertsRes.data);
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div><p>Carregando relatórios...</p></div>;
    }

    const severityColors: any = {
        critica: '#dc2626',
        alta: '#f59e0b',
        media: '#3b82f6',
        baixa: '#64748b'
    };

    return (
        <div className="tickets-page">
            <div className="page-header">
                <div>
                    <h1>Relatórios Analíticos</h1>
                    <p>Visão completa de ativos, manutenções e alertas</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Período:</label>
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ padding: '8px 12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
                        <option value="7">Últimos 7 dias</option>
                        <option value="30">Últimos 30 dias</option>
                        <option value="90">Últimos 90 dias</option>
                        <option value="365">Último ano</option>
                    </select>
                </div>
            </div>

            {/* Alertas */}
            {alerts.length > 0 && (
                <div style={{ marginBottom: '24px', padding: '20px', background: 'linear-gradient(135deg, #fee2e2 0%, #fef3c7 100%)', borderRadius: '16px', border: '2px solid #fca5a5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <AlertCircle size={24} color="#dc2626" />
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#991b1b' }}>Alertas Ativos ({alerts.length})</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                        {alerts.slice(0, 6).map((alert, index) => (
                            <div key={index} style={{
                                padding: '12px',
                                background: 'white',
                                borderRadius: '10px',
                                borderLeft: `4px solid ${severityColors[alert.severity]}`,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'start', marginBottom: '8px' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        background: severityColors[alert.severity],
                                        color: 'white',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                    }}>
                                        {alert.severity}
                                    </span>
                                </div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{alert.title}</h4>
                                <p style={{ margin: '0', fontSize: '13px', color: '#64748b' }}>{alert.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cards de Resumo */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div style={{ padding: '24px', background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)', borderRadius: '16px', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Total de Ativos</p>
                            <h2 style={{ margin: 0, fontSize: '36px', fontWeight: '700' }}>{operationalData?.assets?.total || 0}</h2>
                        </div>
                        <BarChart3 size={40} style={{ opacity: 0.8 }} />
                    </div>
                </div>

                <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '16px', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Manutenções ({period} dias)</p>
                            <h2 style={{ margin: 0, fontSize: '36px', fontWeight: '700' }}>{maintenanceReport?.summary?.[0]?.totalMaintenances || 0}</h2>
                        </div>
                        <TrendingUp size={40} style={{ opacity: 0.8 }} />
                    </div>
                </div>

                <div style={{ padding: '24px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '16px', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Custo Total Manutenções</p>
                            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>R$ {(maintenanceReport?.summary?.[0]?.totalCost || 0).toFixed(2)}</h2>
                        </div>
                        <DollarSign size={40} style={{ opacity: 0.8 }} />
                    </div>
                </div>

                <div style={{ padding: '24px', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '16px', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Valor Total Ativos</p>
                            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>R$ {(assetReport?.totalValue?.[0]?.total || 0).toFixed(2)}</h2>
                        </div>
                        <PieChart size={40} style={{ opacity: 0.8 }} />
                    </div>
                </div>
            </div>

            {/* Ativos por Status */}
            <div style={{ marginBottom: '24px', padding: '24px', background: 'white', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Ativos por Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {assetReport?.byStatus?.map((item: any) => (
                        <div key={item._id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#2d6a4f', marginBottom: '8px' }}>{item.count}</div>
                            <div style={{ fontSize: '14px', color: '#64748b', textTransform: 'capitalize' }}>{item._id || 'Não definido'}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ativos por Localização */}
            <div style={{ marginBottom: '24px', padding: '24px', background: 'white', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Top 10 Localizações</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {assetReport?.byLocation?.slice(0, 10).map((item: any, index: number) => {
                        const maxCount = assetReport.byLocation[0]?.count || 1;
                        const percentage = (item.count / maxCount) * 100;
                        return (
                            <div key={index}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                                    <span style={{ fontWeight: '600', color: '#475569' }}>{item._id || 'Não definido'}</span>
                                    <span style={{ color: '#64748b' }}>{item.count} ativos</span>
                                </div>
                                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${percentage}%`, background: 'linear-gradient(90deg, #2d6a4f 0%, #1b4332 100%)', transition: 'width 0.3s ease' }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Manutenções por Tipo */}
            <div style={{ marginBottom: '24px', padding: '24px', background: 'white', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Manutenções por Tipo</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {maintenanceStats?.byType?.map((item: any) => (
                        <div key={item._id} style={{ padding: '20px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderRadius: '12px', border: '2px solid #bae6fd' }}>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#0369a1', marginBottom: '8px' }}>{item.count}</div>
                            <div style={{ fontSize: '14px', color: '#475569', fontWeight: '600', marginBottom: '4px', textTransform: 'capitalize' }}>{item._id}</div>
                            <div style={{ fontSize: '13px', color: '#0369a1', fontWeight: '600' }}>R$ {(item.totalCost || 0).toFixed(2)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top 10 Peças Mais Usadas */}
            {maintenanceReport?.topParts && maintenanceReport.topParts.length > 0 && (
                <div style={{ marginBottom: '24px', padding: '24px', background: 'white', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Top 10 Peças Mais Utilizadas</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                        {maintenanceReport.topParts.slice(0, 10).map((part: any, index: number) => (
                            <div key={index} style={{ padding: '16px', background: '#fef3c7', borderRadius: '10px', border: '2px solid #fde047' }}>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: '#a16207', marginBottom: '4px' }}>{part.quantity}x</div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>{part._id}</div>
                                <div style={{ fontSize: '13px', color: '#a16207', fontWeight: '600' }}>R$ {(part.totalCost || 0).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Garantias Vencendo */}
            {assetReport?.warrantyExpiring && assetReport.warrantyExpiring.length > 0 && (
                <div style={{ marginBottom: '24px', padding: '24px', background: 'white', borderRadius: '16px', border: '2px solid #fca5a5' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={20} />
                        Garantias Vencendo (90 dias)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {assetReport.warrantyExpiring.map((asset: any) => (
                            <div key={asset._id} style={{ padding: '16px', background: '#fef2f2', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{asset.assetId} - {asset.description}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{asset.location || 'Localização não definida'}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>
                                        Vence em: {new Date(asset.warrantyExpiration).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
