import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Printer, RotateCcw, Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { preScheduleService, formatDateBR } from '../../services/slaughterService';
import { SlaughterPreSchedule as ISlaughterPreSchedule, SlaughterPreLot } from '../../types/slaughter';
import { toast } from 'react-toastify';
import SlaughterLotModal from '../../components/slaughter/SlaughterLotModal';
import './Slaughter.css';

export const SlaughterPreSchedule: React.FC = () => {
    const { date } = useParams<{ date: string }>();
    const navigate = useNavigate();
    const [schedule, setSchedule] = useState<ISlaughterPreSchedule | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLot, setEditingLot] = useState<SlaughterPreLot | undefined>(undefined);

    useEffect(() => {
        if (date) loadData(date);
    }, [date]);

    const loadData = async (dateStr: string) => {
        try {
            setLoading(true);
            const response = await preScheduleService.getByDate(dateStr);
            setSchedule(response.data);
        } catch (error) {
            toast.error('Erro ao carregar pré-escala');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (updatedData: Partial<ISlaughterPreSchedule>) => {
        if (!schedule) return;
        try {
            const response = await preScheduleService.update(schedule._id, updatedData);
            setSchedule(response.data);
            toast.success('Alterações salvas');
        } catch (error) {
            toast.error('Erro ao salvar');
        }
    };

    const handlePublish = async () => {
        if (!schedule) return;
        if (!window.confirm('Deseja publicar esta pré-escala? Isso sincronizará os dados com a Escala de Abate oficial.')) return;
        
        try {
            await preScheduleService.publish(schedule._id);
            toast.success('Pré-escala publicada com sucesso!');
            navigate(`/slaughter/schedule/${date}`);
        } catch (error) {
            toast.error('Erro ao publicar');
        }
    };

    const handleAddLot = () => {
        setEditingLot(undefined);
        setIsModalOpen(true);
    };

    const handleEditLot = (lot: SlaughterPreLot) => {
        setEditingLot(lot);
        setIsModalOpen(true);
    };

    const handleDeleteLot = async (lotRefId: string) => {
        if (!schedule || !window.confirm('Excluir este lote?')) return;
        
        const updatedLots = schedule.lots.filter(l => l.preLotRefId !== lotRefId);
        await handleSave({ lots: updatedLots });
    };

    const handleSaveLot = async (lotData: Partial<SlaughterPreLot>) => {
        if (!schedule) return;

        let updatedLots = [...schedule.lots];
        if (editingLot) {
            updatedLots = updatedLots.map(l => 
                l.preLotRefId === editingLot.preLotRefId ? { ...l, ...lotData } : l
            );
        } else {
            const newLot: SlaughterPreLot = {
                ...lotData as SlaughterPreLot,
                preLotRefId: Math.random().toString(36).substr(2, 9)
            };
            updatedLots.push(newLot);
        }

        await handleSave({ lots: updatedLots });
    };

    const calculateRowTiming = (lots: SlaughterPreLot[], index: number) => {
        if (!schedule) return '--:--';
        
        let currentStartTime = schedule.startTime;
        
        for (let i = 0; i <= index; i++) {
            const lot = lots[i];
            const duration = Math.ceil((lot.total / (schedule.rateHeadsPerHour || 100)) * 60);
            
            // Basic conversion for display
            let [h, m] = currentStartTime.split(':').map(Number);
            let startMins = h * 60 + m;
            
            // Check intervals (simplified logic for front display)
            const breakStart = 8 * 60; // 08:00
            const breakEnd = 8 * 60 + 15;
            const lunchStart = 11 * 60; // 11:00
            const lunchEnd = 11 * 60 + 70;
            
            if (startMins >= breakStart && startMins < breakEnd) startMins = breakEnd;
            if (startMins >= lunchStart && startMins < lunchEnd) startMins = lunchEnd;
            
            let endMins = startMins + duration;
            if (startMins < breakStart && endMins > breakStart) endMins += 15;
            if (startMins < lunchStart && endMins > lunchStart) endMins += 70;
            
            if (i === index) {
                const fh = Math.floor(endMins / 60) % 24;
                const fm = Math.round(endMins % 60);
                return `${String(fh).padStart(2, '0')}:${String(fm).padStart(2, '0')}`;
            }
            
            const fh = Math.floor(endMins / 60) % 24;
            const fm = Math.round(endMins % 60);
            currentStartTime = `${String(fh).padStart(2, '0')}:${String(fm).padStart(2, '0')}`;
        }
        return '--:--';
    };

    if (loading) return <div className="slaughter-container">Carregando...</div>;
    if (!schedule) return <div className="slaughter-container">Data inválida</div>;

    const totals = schedule.lots.reduce((acc, lot) => {
        acc.boi += lot.boi || 0;
        acc.vaca += lot.vaca || 0;
        acc.novilha += lot.novilha || 0;
        acc.bubalino += lot.bubalino || 0;
        acc.touro += lot.touro || 0;
        acc.total += lot.total || 0;
        return acc;
    }, { boi: 0, vaca: 0, novilha: 0, bubalino: 0, touro: 0, total: 0 });

    return (
        <div className="slaughter-container">
            <header className="slaughter-header slaughter-header-purple">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/slaughter/calendar')} className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30">
                            <ArrowLeft size={16} /> Voltar
                        </button>
                        <h1 className="!mb-0">Pré Escala de Abate – {formatDateBR(date!)}</h1>
                        <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold uppercase">{schedule.status}</span>
                    </div>

                    <div className="params-container">
                        <div className="param-field">
                            <label>Hora de Início:</label>
                            <input 
                                type="time" 
                                value={schedule.startTime} 
                                onChange={(e) => handleSave({ startTime: e.target.value })}
                            />
                        </div>
                        <div className="param-field">
                            <label>Taxa de Abate (CABS/H):</label>
                            <input 
                                type="number" 
                                value={schedule.rateHeadsPerHour} 
                                onChange={(e) => handleSave({ rateHeadsPerHour: Number(e.target.value) })}
                            />
                        </div>
                        <div className="param-field">
                            <label>Café:</label>
                            <div className="flex gap-1">
                                <input type="time" value={schedule.breakfastTime} className="w-20" readOnly />
                                <input type="number" value={schedule.breakfastDuration} className="w-12" readOnly />
                                <span className="text-[10px] items-center flex font-bold text-white/50">MIN</span>
                            </div>
                        </div>
                        <div className="param-field">
                            <label>Almoço:</label>
                            <div className="flex gap-1">
                                <input type="time" value={schedule.lunchTime} className="w-20" readOnly />
                                <input type="number" value={schedule.lunchDuration} className="w-12" readOnly />
                                <span className="text-[10px] items-center flex font-bold text-white/50">MIN</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 items-start">
                    <button onClick={handlePublish} className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                        <Send size={18} /> Publicar Escala
                    </button>
                </div>
            </header>

            <div className="mb-4 text-xs font-bold text-slate-500 uppercase">Totais (Pré-Escala)</div>
            <div className="totals-row">
                <div className="total-card">
                    <span className="label">Boi:</span>
                    <span className="value">{totals.boi}</span>
                </div>
                <div className="total-card">
                    <span className="label">Vaca:</span>
                    <span className="value">{totals.vaca}</span>
                </div>
                <div className="total-card">
                    <span className="label">Novilha:</span>
                    <span className="value">{totals.novilha}</span>
                </div>
                <div className="total-card">
                    <span className="label">Bubalino:</span>
                    <span className="value">{totals.bubalino}</span>
                </div>
                <div className="total-card">
                    <span className="label">Touro:</span>
                    <span className="value">{totals.touro}</span>
                </div>
                <div className="total-card highlight">
                    <span className="label">Total Geral:</span>
                    <span className="value">{totals.total}</span>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-700">Pré Escala Diária</h3>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 border border-slate-200 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                        <Printer size={16} /> Imprimir PDF
                    </button>
                    <button className="flex items-center gap-2 border border-red-200 px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50">
                        <RotateCcw size={16} /> Reabrir Lote
                    </button>
                    <button onClick={handleAddLot} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700">
                        <Plus size={16} /> Adicionar Lote
                    </button>
                </div>
            </div>

            <div className="slaughter-table-container">
                <table className="slaughter-table">
                    <thead>
                        <tr>
                            <th className="w-10">Lote</th>
                            <th>Pecuarista</th>
                            <th>Origem</th>
                            <th>Corretor</th>
                            <th>Boi</th>
                            <th>Vaca</th>
                            <th>Novilha</th>
                            <th>Bub</th>
                            <th>Touro</th>
                            <th>Total</th>
                            <th>Fim Est.</th>
                            <th className="w-20">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.lots.map((lot, idx) => (
                            <tr key={lot.preLotRefId || idx}>
                                <td className="font-bold flex items-center gap-2">
                                    <GripVertical size={14} className="text-slate-300" />
                                    {idx + 1}
                                </td>
                                <td className="font-medium text-slate-700">{lot.producerName}</td>
                                <td className="text-xs text-slate-500">{lot.municipio}/{lot.uf}</td>
                                <td className="text-xs text-slate-500">{lot.brokerCode}</td>
                                <td>{lot.boi}</td>
                                <td>{lot.vaca}</td>
                                <td>{lot.novilha}</td>
                                <td>{lot.bubalino}</td>
                                <td>{lot.touro}</td>
                                <td className="font-black text-indigo-600">{lot.total}</td>
                                <td className="text-slate-400 text-xs">{calculateRowTiming(schedule.lots, idx)}</td>
                                <td>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEditLot(lot)} className="action-btn" title="Editar"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDeleteLot(lot.preLotRefId)} className="action-btn text-red-400 hover:text-red-600" title="Excluir"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <SlaughterLotModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveLot}
                lot={editingLot}
            />
        </div>
    );
};
