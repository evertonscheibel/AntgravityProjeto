import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, CheckCircle, FileText, Download, 
    GripVertical, RotateCcw, AlertCircle, Save 
} from 'lucide-react';
import { slaughterClosureService, formatDateBR } from '../../services/slaughterService';
import { SlaughterClosure as ISlaughterClosure, SlaughterClosureLine } from '../../types/slaughter';
import { toast } from 'react-toastify';

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

// Componente para linha arrastável do fechamento
const SortableClosureRow: React.FC<{ 
    line: SlaughterClosureLine; 
    index: number;
    status: string;
    onUpdate: (index: number, field: string, value: string) => void;
}> = ({ line, index, status, onUpdate }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: line._id! });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isDragging ? '#f1f5f9' : 'transparent',
        zIndex: isDragging ? 100 : 'auto',
    };

    const isClosed = status === 'CLOSED';
    const isIncomplete = !line.curral || !line.municipio || !line.uf;

    return (
        <tr ref={setNodeRef} style={style} className={isIncomplete && !isClosed ? 'bg-red-50/40' : ''}>
            <td className="text-center font-bold text-slate-400">
                {!isClosed && (
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 inline-block mr-1">
                        <GripVertical size={12} className="text-slate-300" />
                    </div>
                )}
                {line.sequence}
            </td>
            <td className="font-bold min-w-[150px]">{line.producerName}</td>
            <td>{line.boi}</td>
            <td>{line.vaca}</td>
            <td>{line.novilha}</td>
            <td>{line.bubalino}</td>
            <td>{line.touro}</td>
            <td className="font-bold">{line.total}</td>
            <td className={!line.curral && !isClosed ? 'bg-red-100/50' : ''}>
                <input 
                    type="text" 
                    className="w-full p-1.5 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: B1"
                    value={line.curral || ''} 
                    onChange={(e) => onUpdate(index, 'curral', e.target.value)}
                    disabled={isClosed}
                />
            </td>
            <td className={!line.municipio && !isClosed ? 'bg-red-100/50' : ''}>
                <input 
                    type="text" 
                    className="w-full p-1.5 border border-slate-200 rounded text-sm min-w-[100px]"
                    value={line.municipio || ''} 
                    onChange={(e) => onUpdate(index, 'municipio', e.target.value)}
                    disabled={isClosed}
                />
            </td>
            <td className={!line.uf && !isClosed ? 'bg-red-100/50' : ''}>
                <input 
                    type="text" 
                    className="w-12 p-1.5 border border-slate-200 rounded text-sm text-center uppercase"
                    value={line.uf || ''} 
                    maxLength={2}
                    onChange={(e) => onUpdate(index, 'uf', e.target.value)}
                    disabled={isClosed}
                />
            </td>
            <td>
                <input 
                    type="text" 
                    className="w-full p-1.5 border border-slate-200 rounded text-sm min-w-[80px]"
                    value={line.cor || ''} 
                    onChange={(e) => onUpdate(index, 'cor', e.target.value)}
                    disabled={isClosed}
                />
            </td>
            <td>
                <input 
                    type="text" 
                    className="w-full p-1.5 border border-slate-200 rounded text-sm min-w-[80px]"
                    value={line.nf || ''} 
                    onChange={(e) => onUpdate(index, 'nf', e.target.value)}
                    disabled={isClosed}
                />
            </td>
            <td>
                <input 
                    type="text" 
                    className="w-full p-1.5 border border-slate-200 rounded text-sm min-w-[100px]"
                    value={line.gta || ''} 
                    onChange={(e) => onUpdate(index, 'gta', e.target.value)}
                    disabled={isClosed}
                />
            </td>
        </tr>
    );
};

export const SlaughterClosure: React.FC = () => {
    const { date } = useParams<{ date: string }>();
    const navigate = useNavigate();
    const [closure, setClosure] = useState<ISlaughterClosure | null>(null);
    const [loading, setLoading] = useState(true);

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
            const response = await slaughterClosureService.getByDate(dateStr);
            setClosure(response.data);
        } catch (error) {
            setClosure(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await slaughterClosureService.createFromSchedule(date!);
            toast.success('Fechamento SIF iniciado');
            loadData(date!);
        } catch (error) {
            toast.error('Erro ao iniciar: ' + (error as Error).message);
        }
    };

    const handleUpdateLine = (index: number, field: string, value: string) => {
        if (!closure) return;
        const newLines = [...closure.lines];
        (newLines[index] as any)[field] = value;
        setClosure({ ...closure, lines: newLines });
    };

    const handleSave = async () => {
        if (!closure) return;
        try {
            await slaughterClosureService.update(closure._id, { lines: closure.lines, header: closure.header });
            toast.success('Dados salvos');
        } catch (error) {
            toast.error('Erro ao salvar');
        }
    };

    const handleClose = async () => {
        if (!closure) return;
        try {
            await slaughterClosureService.close(closure._id);
            toast.success('Boletim SIF fechado com sucesso!');
            loadData(date!);
        } catch (error) {
            toast.error('Erro ao fechar: ' + (error as Error).message);
        }
    };

    const handleReopen = async () => {
        if (!closure) return;
        const reason = window.prompt('Informe o motivo da reabertura:');
        if (!reason) return;

        try {
            await slaughterClosureService.reopen(closure._id, reason);
            toast.success('Fechamento reaberto');
            loadData(date!);
        } catch (error) {
            toast.error('Erro ao reabrir');
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!closure || !over || active.id === over.id) return;

        const oldIndex = closure.lines.findIndex(l => l._id === active.id);
        const newIndex = closure.lines.findIndex(l => l._id === over.id);

        const newLines = arrayMove(closure.lines, oldIndex, newIndex);
        setClosure({ ...closure, lines: newLines });

        try {
            await slaughterClosureService.reorderLines(closure._id, newLines.map(l => l._id!));
            toast.success('Sequência atualizada');
            loadData(date!);
        } catch (error) {
            toast.error('Erro ao reordenar');
            loadData(date!);
        }
    };

    if (loading) return <div className="slaughter-container">Carregando...</div>;

    if (!closure) {
        return (
            <div className="slaughter-container">
                <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-slate-200">
                    <FileText size={64} className="mx-auto text-slate-200 mb-6" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Fechamento SIF não iniciado</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Após finalizar a escala oficial, os dados ficam disponíveis para o preenchimento regulatório do SIF.</p>
                    <div className="flex gap-4 justify-center">
                         <button onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all">
                            Voltar
                        </button>
                        <button onClick={handleCreate} className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                            Iniciar Fechamento SIF
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isClosed = closure.status === 'CLOSED';

    return (
        <div className="slaughter-container">
            <header className="slaughter-header bg-slate-900/95 backdrop-blur-md sticky top-0 z-20 border-b border-white/10">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/slaughter/calendar')} className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-lg text-sm hover:bg-white/20 transition-all border border-white/5">
                            <ArrowLeft size={16} /> Voltar
                        </button>
                        <h1 className="!mb-0 text-white tracking-tight">Boletim de Abate SIF – {formatDateBR(date!)}</h1>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${isClosed ? 'bg-green-500 text-white' : 'bg-amber-400 text-amber-900 animate-pulse'}`}>
                            {isClosed ? 'Encerrado (SIF)' : 'Em Processamento'}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    {!isClosed ? (
                        <>
                            <button onClick={handleSave} className="flex items-center gap-2 bg-white/10 text-white border border-white/20 px-5 py-2 rounded-xl font-bold hover:bg-white/20 transition-all shadow-sm">
                                <Save size={18} /> Salvar Parcial
                            </button>
                            <button onClick={handleClose} className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-900/40 hover:-translate-y-0.5 active:translate-y-0">
                                <CheckCircle size={18} /> Finalizar Boletim
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={handleReopen} className="flex items-center gap-2 bg-white/10 text-red-400 border border-white/10 px-4 py-2 rounded-xl font-bold hover:bg-red-500/10 transition-all">
                                <RotateCcw size={18} /> Reabrir
                            </button>
                            <button onClick={() => window.open(slaughterClosureService.exportPdf(closure._id), '_blank')} className="flex items-center gap-2 bg-white text-indigo-600 px-5 py-2 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-md">
                                <Download size={18} /> Boletim PDF
                            </button>
                            <button onClick={() => window.location.href = slaughterClosureService.exportXlsm(closure._id)} className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-md">
                                <Download size={18} /> Planilha SIF
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="bg-slate-50 p-4 border-b border-slate-200 flex gap-8 items-center justify-between">
                <div className="flex gap-8">
                    <div className="text-sm">
                        <span className="text-slate-400 font-bold uppercase block text-[10px]">Veterinário Responsável</span>
                        <span className="font-bold text-slate-700">{closure.header.veterinarian || 'Não informado'}</span>
                    </div>
                    <div className="text-sm">
                        <span className="text-slate-400 font-bold uppercase block text-[10px]">Estabelecimento</span>
                        <span className="font-bold text-slate-700">{closure.header.sifNumber}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                    <FileText size={20} />
                    <span>{closure.totalCattle} Cabeças Total</span>
                </div>
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
                                <th className="w-12 text-center">Seq</th>
                                <th>Pecuarista</th>
                                <th>Boi</th>
                                <th>Vaca</th>
                                <th>Nov</th>
                                <th>Bub</th>
                                <th>Touro</th>
                                <th>Total</th>
                                <th className="bg-amber-50">Curral *</th>
                                <th className="bg-amber-50">Município *</th>
                                <th className="bg-amber-50">UF *</th>
                                <th>Cor</th>
                                <th>NF</th>
                                <th>GTA</th>
                            </tr>
                        </thead>
                        <tbody>
                            <SortableContext 
                                items={closure.lines.map(l => l._id!)}
                                strategy={verticalListSortingStrategy}
                            >
                                {closure.lines.map((line, idx) => (
                                    <SortableClosureRow 
                                        key={line._id} 
                                        line={line} 
                                        index={idx}
                                        status={closure.status}
                                        onUpdate={handleUpdateLine}
                                    />
                                ))}
                            </SortableContext>
                        </tbody>
                    </table>
                </DndContext>
            </div>

            {!isClosed && (
                <div className="mt-6 flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm">
                    <AlertCircle size={20} className="shrink-0 text-amber-500" />
                    <div>
                        <strong>Campos Obrigatórios:</strong> Curral, Município e UF são campos indispensáveis para a geração do Boletim de Abate SIF. 
                        Linhas incompletas estão destacadas em vermelho.
                    </div>
                </div>
            )}
        </div>
    );
};
