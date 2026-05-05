import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { slaughterService } from '../../services/slaughterService';
import { CalendarDay, MonthlySummary } from '../../types/slaughter';
import './Slaughter.css';

export const SlaughterCalendar: React.FC = () => {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [days, setDays] = useState<CalendarDay[]>([]);
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [loading, setLoading] = useState(true);

    const monthName = currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const formattedMonth = currentMonth.toISOString().substring(0, 7); // YYYY-MM

    useEffect(() => {
        loadData();
    }, [formattedMonth]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await slaughterService.getCalendar(formattedMonth);
            setDays(response.data);
            setSummary(response.monthlySummary);
        } catch (error) {
            console.error('Erro ao carregar calendário:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => {
        const next = new Date(currentMonth);
        next.setMonth(next.getMonth() + 1);
        setCurrentMonth(next);
    };

    const prevMonth = () => {
        const prev = new Date(currentMonth);
        prev.setMonth(prev.getMonth() - 1);
        setCurrentMonth(prev);
    };

    const handleDayClick = (date: string) => {
        // Por padrão, leva para a pré-escala (planejamento)
        navigate(`/slaughter/pre-schedule/${date}`);
    };

    // Lógica para preencher o grid do calendário
    const renderCalendarGrid = () => {
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Dom) a 6 (Sáb)
        
        const gridItems = [];
        
        // Espaços vazios para os dias do mês anterior
        for (let i = 0; i < startingDayOfWeek; i++) {
            gridItems.push(<div key={`empty-${i}`} className="calendar-day-card other-month" />);
        }

        // Dias do mês atual
        days.forEach((day, index) => {
            const dayNum = index + 1;
            const statusClass = day.status?.toLowerCase() || '';

            gridItems.push(
                <div 
                    key={day.date} 
                    className="calendar-day-card"
                    onClick={() => handleDayClick(day.date)}
                >
                    <div className="calendar-day-number">{dayNum}</div>
                    
                    {day.status && (
                        <div className={`status-badge ${statusClass}`}>
                            {day.status === 'PUBLISHED' ? 'PUBL' : day.status === 'ENVIADA' ? 'ENVIADA' : day.status}
                        </div>
                    )}
                    
                    {day.totalCattle ? (
                        <div className="day-totals">
                            <strong>{day.totalCattle}</strong> cabs
                        </div>
                    ) : null}
                </div>
            );
        });

        return gridItems;
    };

    return (
        <div className="slaughter-container">
            <header className="slaughter-header">
                <h1><CalendarIcon /> Escala de Abate</h1>
                
                <div className="flex items-center gap-4 bg-white/10 p-1 rounded-lg">
                    <button onClick={prevMonth} className="p-1 hover:bg-white/20 rounded"><ChevronLeft size={20} /></button>
                    <span className="min-w-[150px] text-center font-bold capitalize">{monthName}</span>
                    <button onClick={nextMonth} className="p-1 hover:bg-white/20 rounded"><ChevronRight size={20} /></button>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center p-20">Carregando dados...</div>
            ) : (
                <>
                    <div className="calendar-grid">
                        <div className="calendar-header-days">
                            <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
                        </div>
                        <div className="calendar-days-container">
                            {renderCalendarGrid()}
                        </div>
                    </div>

                    {summary && (
                        <div className="mt-8">
                            <h3 className="text-slate-500 font-bold uppercase text-xs mb-4">Totais Mensais (Abates Fechados)</h3>
                            <div className="totals-row">
                                <div className="total-card">
                                    <span className="label">Boi:</span>
                                    <span className="value">{summary.totalBoi}</span>
                                </div>
                                <div className="total-card">
                                    <span className="label">Vaca:</span>
                                    <span className="value">{summary.totalVaca}</span>
                                </div>
                                <div className="total-card">
                                    <span className="label">Novilha:</span>
                                    <span className="value">{summary.totalNovilha}</span>
                                </div>
                                <div className="total-card">
                                    <span className="label">Bubalino:</span>
                                    <span className="value">{summary.totalBubalino}</span>
                                </div>
                                <div className="total-card">
                                    <span className="label">Touro:</span>
                                    <span className="value">{summary.totalTouro}</span>
                                </div>
                                <div className="total-card highlight">
                                    <span className="label">Total Geral:</span>
                                    <span className="value">{summary.totalCattle}</span>
                                </div>
                                <div className="total-card">
                                    <span className="label">Dias Fechados:</span>
                                    <span className="value">{summary.closedDays}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
