import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Clock, CheckCircle, Scale, Printer, 
    Settings, Plus, Trash2, Edit2, GripVertical, AlertTriangle, 
    RotateCcw, RefreshCw 
} from 'lucide-react';
import { slaughterService, formatDateBR, timeToMinutes, minutesToTime } from '../../services/slaughterService';
import { SlaughterSchedule as ISlaughterSchedule, SlaughterLot } from '../../types/slaughter';
import { toast } from 'react-toastify';
import SlaughterLotModal from '../../components/slaughter/SlaughterLotModal';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import './Slaughter.css';

// Componente para linha arrastável
const SortableRow: React.FC<{ 
    lot: SlaughterLot; 
    canEdit: boolean;
    onEdit: (lot: SlaughterLot) => void;
    onDelete: (id: string) => void;
}> = ({ lot, canEdit, onEdit, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: lot._id! });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style}>
            <td className="font-bold flex items-center gap-2">
                {canEdit && (
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded">
                        <GripVertical size={14} className="text-slate-300" />
                    </div>
                )}
                {lot.lotNumber}
            </td>
            <td className="font-medium text-slate-700">{lot.rancherName}</td>
            <td className="text-xs text-slate-500">{lot.brokerNumber}</td>
            <td className="text-center">{lot.boi}</td>
            <td className="text-center">{lot.vaca}</td>
            <td className="text-center">{lot.novilha}</td>
            <td className="text-center">{lot.bubalino}</td>
            <td className="text-center">{lot.touro}</td>
            <td className="font-black text-indigo-600 text-center">{lot.total}</td>
            <td className="text-indigo-600 font-bold">{lot.startTime}</td>
            <td className="text-slate-400 text-xs">{lot.durationMinutes} min</td>
            <td className="text-indigo-600 font-bold">{lot.endTime}</td>
            <td>
                {canEdit ? (
                    <div className="flex gap-1">
                        <button onClick={() => onEdit(lot)} className="action-btn"><Edit2 size={14} /></button>
                        <button onClick={() => onDelete(lot._id!)} className="action-btn text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                ) : (
                    <span className="text-[10px] bg-green-100 px-2 py-0.5 rounded text-green-600 font-bold">FECHADO</span>
                )}
            </td>
        </tr>
    );
};

export const SlaughterSchedule: React.FC = () => {
    const { date } = useParams<{ date: string }>();
    const navigate = useNavigate();
    const [schedule, setSchedule] = useState<ISlaughterSchedule | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLot, setEditingLot] = useState<SlaughterLot | undefined>(undefined);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (date) loadData(date);
    }, [date]);

    const loadData = async (dateStr: string) => {
        try {
            setLoading(true);
            const response = await slaughterService.getByDate(dateStr);
            setSchedule(response.data);
        } catch (error) {
            toast.error('Escala não encontrada ou erro ao carregar');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSchedule = async (params: Partial<ISlaughterSchedule>) => {
        if (!schedule) return;
        try {
            await slaughterService.updateSchedule(schedule._id, params);
            toast.success('Escala atualizada');
            loadData(date!);
        } catch (error) {
            toast.error('Erro ao atualizar escala');
        }
    };

    const handleClose = async () => {
        if (!schedule) return;
        if (!window.confirm('Deseja fechar esta escala? O fechamento SIF será iniciado.')) return;

        try {
            await slaughterService.close(schedule._id);
            toast.success('Escala fechada com sucesso!');
            loadData(date!);
        } catch (error) {
            toast.error((error as Error).message);
        }
    };

    const handleReopen = async () => {
        if (!schedule) return;
        if (!window.confirm('Deseja REABRIR esta escala?')) return;

        try {
            await slaughterService.reopen(schedule._id);
            toast.success('Escala reaberta');
            loadData(date!);
        } catch (error) {
            toast.error('Erro ao reabrir');
        }
    };

    const handleRecalculate = async () => {
        if (!schedule) return;
        try {
            await slaughterService.recalculate(schedule._id);
            toast.success('Horários recalculados');
            loadData(date!);
        } catch (error) {
            toast.error('Erro ao recalcular');
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!schedule || !over || active.id === over.id) return;

        const oldIndex = schedule.lots.findIndex(l => l._id === active.id);
        const newIndex = schedule.lots.findIndex(l => l._id === over.id);

        const newLots = arrayMove(schedule.lots, oldIndex, newIndex);
        setSchedule({ ...schedule, lots: newLots });

        try {
            await slaughterService.reorderLots(schedule._id, newLots.map(l => l._id!));
            toast.success('Ordem atualizada');
            loadData(date!);
        } catch (error) {
            toast.error('Erro ao reordenar');
            loadData(date!); // Reverte se falhar
        }
    };

    const handleAddLot = () => {
        setEditingLot(undefined);
        setIsModalOpen(true);
    };

    const handleEditLot = (lot: SlaughterLot) => {
        setEditingLot(lot);
        setIsModalOpen(true);
    };

    const handleDeleteLot = async (id: string) => {
        if (!window.confirm('Remover este lote?')) return;
        try {
            await slaughterService.deleteLot(id);
            toast.success('Lote removido');
            loadData(date!);
        } catch (error) {
            toast.error('Erro ao excluir');
        }
    };

    const handleSaveLot = async (lotData: any) => {
        if (!schedule) return;
        try {
            // Mapeamento caso os nomes de campos sejam diferentes
            const payload = {
                rancherName: lotData.producerName,
                brokerNumber: lotData.brokerCode || '0',
                boi: lotData.boi,
                vaca: lotData.vaca,
                novilha: lotData.novilha,
                bubalino: lotData.bubalino,
                touro: lotData.touro
            };

            if (editingLot) {
                await slaughterService.updateLot(editingLot._id!, payload);
                toast.success('Lote atualizado');
            } else {
                await slaughterService.createLot(schedule._id, payload);
                toast.success('Lote adicionado');
            }
            loadData(date!);
        } catch (error) {
            toast.error('Erro ao salvar lote');
        }
    };

    if (loading) return <div className="slaughter-container">Carregando...</div>;
    if (!schedule) return <div className="slaughter-container">Escala não encontrada</div>;

    const canEdit = schedule.status === 'DRAFT';

    const getBreakRow = (type: 'BREA' | 'LUNC', time?: string, duration?: number) => {
        if (!time || !duration) return null;
        return (
            <tr key={type} className="bg-amber-50/40 text-amber-700 italic text-xs">
                <td colSpan={9} className="py-1 text-center font-bold">
                    {type === 'BREA' ? 'CAFÉ DA MANHÃ' : 'ALMOÇO'}
                </td>
                <td className="font-bold">{time}</td>
                <td>{duration} min</td>
                <td className="font-bold">{minutesToTime(timeToMinutes(time) + duration)}</td>
                <td></td>
            </tr>
        );
    };

    const renderRowsWithBreaks = () => {
        const rows: React.ReactNode[] = [];
        const lots = schedule.lots || [];
        
        let breakfastAdded = false;
        let lunchAdded = false;

        lots.forEach((lot) => {
            const lotStart = timeToMinutes(lot.startTime);
            const bStart = schedule.breakfastTime ? timeToMinutes(schedule.breakfastTime) : 0;
            const lStart = schedule.lunchTime ? timeToMinutes(schedule.lunchTime) : 0;

            if (!breakfastAdded && bStart > 0 && lotStart >= bStart) {
                const brk = getBreakRow('BREA', schedule.breakfastTime, schedule.breakfastDuration);
                if (brk) rows.push(brk);
                breakfastAdded = true;
            }

            if (!lunchAdded && lStart > 0 && lotStart >= lStart) {
                const brk = getBreakRow('LUNC', schedule.lunchTime, schedule.lunchDuration);
                if (brk) rows.push(brk);
                lunchAdded = true;
            }

            rows.push(
                <SortableRow 
                    key={lot._id} 
                    lot={lot} 
                    canEdit={canEdit} 
                    onEdit={handleEditLot} 
                    onDelete={handleDeleteLot} 
                />
            );
        });

        // Caso os intervalos sejam após o último lote (raro, mas possível p/ visualização)
        if (!breakfastAdded && schedule.breakfastTime) {
             const brk = getBreakRow('BREA', schedule.breakfastTime, schedule.breakfastDuration);
             if (brk) rows.push(brk);
        }
        if (!lunchAdded && schedule.lunchTime) {
             const brk = getBreakRow('LUNC', schedule.lunchTime, schedule.lunchDuration);
             if (brk) rows.push(brk);
        }

        return rows;
    };

    return (
        <div className="slaughter-container">
            <header className="slaughter-header">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/slaughter/calendar')} className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30 transition-all">
                            <ArrowLeft size={16} /> Voltar
                        </button>
                        <h1 className="!mb-0"><Scale size={24} /> Escala Oficial de Abate – {formatDateBR(date!)}</h1>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${schedule.status === 'CLOSED' ? 'bg-green-500' : 'bg-blue-500'} shadow-sm`}>
                            {schedule.status === 'CLOSED' ? 'Fechada (SIF)' : 'Em Aberto (PCP)'}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    {canEdit ? (
                        <>
                            <button onClick={handleRecalculate} className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20" title="Forçar recálculo de horários">
                                <RefreshCw size={18} />
                            </button>
                            <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isSettingsOpen ? 'bg-amber-400 text-amber-900 shadow-inner' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'}`}>
                                <Settings size={18} /> Configurar
                            </button>
                            <button onClick={handleClose} className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0">
                                <CheckCircle size={18} /> Finalizar Escala
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-2">
                             <button onClick={handleReopen} className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl font-bold hover:bg-red-500/20 transition-all">
                                <RotateCcw size={18} /> Reabrir
                            </button>
                            <button onClick={() => navigate(`/slaughter/closure/${date}`)} className="flex items-center gap-2 bg-white text-indigo-600 px-5 py-2 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg">
                                <ArrowLeft size={18} className="rotate-180" /> Ver Boletim SIF
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {isSettingsOpen && canEdit && (
                <div className="bg-slate-800/5 backdrop-blur-sm border border-slate-200 p-6 rounded-2xl mb-6 grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2">
                    <div className="param-field light">
                        <label className="text-slate-500 font-bold mb-1 block">Início das Atividades</label>
                        <input 
                            type="time" 
                            className="w-full bg-white border-slate-200"
                            value={schedule.startTime} 
                            onChange={(e) => handleUpdateSchedule({ startTime: e.target.value })}
                        />
                    </div>
                    <div className="param-field light">
                        <label className="text-slate-500 font-bold mb-1 block">Ritmo (Abates/Hora)</label>
                        <input 
                            type="number" 
                            className="w-full bg-white border-slate-200"
                            value={schedule.rateHeadsPerHour} 
                            onChange={(e) => handleUpdateSchedule({ rateHeadsPerHour: Number(e.target.value) })}
                        />
                    </div>
                    <div col-span={2} className="flex items-center gap-4 bg-amber-50 p-4 rounded-xl border border-amber-100 col-span-2">
                        <AlertTriangle className="text-amber-500" size={24} />
                        <div className="text-xs text-amber-800">
                            <strong>Aviso:</strong> Alterar estes parâmetros afetará imediatamente o horário de <strong>todos</strong> os lotes subsequentes.
                        </div>
                    </div>
                </div>
            )}

            <div className="totals-row">
                <div className="total-card">
                    <span className="label">Hora de Início:</span>
                    <span className="value flex items-center gap-2 font-mono"><Clock size={16}/> {schedule.startTime}</span>
                </div>
                <div className="total-card">
                    <span className="label">Cabeças/Hora:</span>
                    <span className="value">{schedule.rateHeadsPerHour}</span>
                </div>
                <div className="total-card highlight">
                    <span className="label">Total Geral:</span>
                    <span className="value">{schedule.totalCattle} <small className="text-xs opacity-60 ml-1">CABS</small></span>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    Sequência de Abate Diário
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{(schedule.lots || []).length} lotes</span>
                </h3>
                {canEdit && (
                    <button onClick={handleAddLot} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:-translate-y-0.5">
                        <Plus size={18} /> Inserir Lote Adicional
                    </button>
                )}
            </div>

            <div className="slaughter-table-container">
                <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <table className="slaughter-table">
                        <thead>
                            <tr>
                                <th className="w-16">Nº</th>
                                <th>Pecuarista</th>
                                <th>Corretor</th>
                                <th>Boi</th>
                                <th>Vaca</th>
                                <th>Nov</th>
                                <th>Bub</th>
                                <th>Touro</th>
                                <th>Total</th>
                                <th>Início</th>
                                <th>Duração</th>
                                <th>Fim</th>
                                <th className="w-20">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <SortableContext 
                                items={(schedule.lots || []).map(l => l._id!)}
                                strategy={verticalListSortingStrategy}
                            >
                                {renderRowsWithBreaks()}
                            </SortableContext>
                        </tbody>
                    </table>
                </DndContext>
            </div>

            <div className="mt-8 flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-200 border-dashed">
                <div className="flex items-center gap-3 text-slate-500 text-sm italic">
                    <AlertTriangle size={18} />
                    Arraste as linhas para alterar a ordem oficial do abate e recalcular horários.
                </div>
                <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm text-slate-600 font-bold hover:bg-slate-100 transition-all shadow-sm">
                    <Printer size={18} /> Imprimir Escala Técnica
                </button>
            </div>

            <SlaughterLotModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveLot}
                lot={editingLot ? {
                    preLotRefId: editingLot._id!,
                    producerName: editingLot.rancherName,
                    brokerCode: editingLot.brokerNumber,
                    boi: editingLot.boi,
                    vaca: editingLot.vaca,
                    novilha: editingLot.novilha,
                    bubalino: editingLot.bubalino,
                    touro: editingLot.touro,
                    total: editingLot.total,
                    municipio: '',
                    uf: ''
                } : undefined}
            />
        </div>
    );
};
