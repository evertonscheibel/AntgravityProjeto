import React, { useState, useEffect } from 'react';
import { assetTimelineService } from '../services';
import { Calendar, User, Tag, Filter } from 'lucide-react';
import BaseModal from './BaseModal';

interface AssetTimelineModalProps {
    assetId: string;
    assetName: string;
    onClose: () => void;
}

const eventTypeColors: any = {
    aquisicao: '#10b981',
    alocacao: '#3b82f6',
    transferencia: '#f59e0b',
    manutencao: '#8b5cf6',
    atualizacao: '#06b6d4',
    baixa: '#ef4444',
    descarte: '#64748b',
    roubo_perda: '#dc2626',
    devolucao: '#14b8a6',
    upgrade: '#2d6a4f',
    incidente: '#f97316',
    mudanca: '#a855f7'
};

const eventTypeLabels: any = {
    aquisicao: 'Aquisição',
    alocacao: 'Alocação',
    transferencia: 'Transferência',
    manutencao: 'Manutenção',
    atualizacao: 'Atualização',
    baixa: 'Baixa',
    descarte: 'Descarte',
    roubo_perda: 'Roubo/Perda',
    devolucao: 'Devolução',
    upgrade: 'Upgrade',
    incidente: 'Incidente',
    mudanca: 'Mudança'
};

export const AssetTimelineModal: React.FC<AssetTimelineModalProps> = ({ assetId, assetName, onClose }) => {
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadTimeline();
    }, [assetId]);

    const loadTimeline = async () => {
        setLoading(true);
        try {
            const response = await assetTimelineService.getByAsset(assetId);
            setTimeline(response.data);
        } catch (error) {
            console.error('Erro ao carregar timeline:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTimeline = filter
        ? timeline.filter(event => event.eventType === filter)
        : timeline;

    const modalFooter = (
        <button type="button" className="btn-secondary" onClick={onClose}>
            Fechar Histórico
        </button>
    );

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title={`Histórico: ${assetName}`}
            footer={modalFooter}
            maxWidth="900px"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Filter size={18} color="#64748b" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Filtrar:</span>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: 'white' }}
                >
                    <option value="">Todos os eventos</option>
                    {Object.keys(eventTypeLabels).sort().map(key => (
                        <option key={key} value={key}>{eventTypeLabels[key]}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '16px', color: '#64748b' }}>Carregando linha do tempo...</p>
                </div>
            ) : (
                <div style={{ position: 'relative', paddingLeft: '20px' }}>
                    {/* Vertical Line */}
                    <div style={{
                        position: 'absolute',
                        left: '29px',
                        top: '0',
                        bottom: '0',
                        width: '3px',
                        background: '#e2e8f0',
                        borderRadius: '2px'
                    }}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {filteredTimeline.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', background: '#f1f5f9', borderRadius: '12px' }}>
                                Nenhum evento registrado para este ativo.
                            </div>
                        ) : (
                            filteredTimeline.map((event) => (
                                <div key={event._id} style={{ position: 'relative', paddingLeft: '40px' }}>
                                    {/* Timeline Marker */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '0',
                                        top: '4px',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: eventTypeColors[event.eventType] || '#64748b',
                                        border: '4px solid white',
                                        boxShadow: '0 0 0 2px #e2e8f0',
                                        zIndex: 1
                                    }}></div>

                                    <div style={{
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '16px',
                                        padding: '20px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                        transition: 'transform 0.2s ease',
                                        cursor: 'default'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '4px 10px',
                                                    background: `${eventTypeColors[event.eventType]}15` || '#f1f5f9',
                                                    color: eventTypeColors[event.eventType] || '#64748b',
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: '800',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    marginBottom: '8px',
                                                    border: `1px solid ${eventTypeColors[event.eventType]}30`
                                                }}>
                                                    {eventTypeLabels[event.eventType] || event.eventType}
                                                </span>
                                                <h3 style={{ margin: '0', fontSize: '17px', fontWeight: '700', color: '#1e293b' }}>{event.title}</h3>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px', fontWeight: '500', background: '#f8fafc', padding: '4px 10px', borderRadius: '20px' }}>
                                                <Calendar size={14} />
                                                {new Date(event.eventDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </div>
                                        </div>

                                        <p style={{ margin: '0 0 16px 0', color: '#444', lineHeight: '1.6', fontSize: '15px' }}>{event.description}</p>

                                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px dashed #e2e8f0' }}>
                                            {event.user && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                                                    <User size={14} />
                                                    <span style={{ fontWeight: '500' }}>{event.user.name}</span>
                                                </div>
                                            )}
                                            {event.cost > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: '700' }}>
                                                    <span>💰 R$ {event.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                            {(event.itilCategory || event.cobitProcess) && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6366f1', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                                                    <Tag size={14} />
                                                    <span>{event.itilCategory || event.cobitProcess}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </BaseModal>
    );
};
