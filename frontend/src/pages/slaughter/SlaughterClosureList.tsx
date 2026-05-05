import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Filter, Download, Eye } from 'lucide-react';
import { slaughterClosureService, formatDateBR } from '../../services/slaughterService';
import { SlaughterClosure } from '../../types/slaughter';
import './Slaughter.css';

export const SlaughterClosureList: React.FC = () => {
    const navigate = useNavigate();
    const [closures, setClosures] = useState<SlaughterClosure[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await slaughterClosureService.list();
            setClosures(response.data);
        } catch (error) {
            console.error('Erro ao carregar lista de fechamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClosures = closures.filter(c => 
        formatDateBR(c.date).includes(searchTerm) || 
        c.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="slaughter-container">
            <header className="slaughter-header">
                <h1><FileText size={24} /> Histórico de Fechamentos SIF</h1>
            </header>

            <div className="flex justify-between items-center mb-6">
                <div className="relative w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Pesquisar por data (DD/MM/YYYY) ou status..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                    <Filter size={18} /> Filtros Avançados
                </button>
            </div>

            <div className="slaughter-table-container">
                <table className="slaughter-table">
                    <thead>
                        <tr>
                            <th>Data do Abate</th>
                            <th>Status</th>
                            <th>Total Cabeças</th>
                            <th>Fechado por</th>
                            <th>Data de Fechamento</th>
                            <th className="w-40 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center p-8">Carregando histórico...</td></tr>
                        ) : filteredClosures.length === 0 ? (
                            <tr><td colSpan={6} className="text-center p-8 text-slate-400">Nenhum fechamento encontrado.</td></tr>
                        ) : filteredClosures.map(closure => (
                            <tr key={closure._id}>
                                <td className="font-bold">{formatDateBR(closure.date)}</td>
                                <td>
                                    <span className={`status-badge ${closure.status.toLowerCase()}`}>
                                        {closure.status}
                                    </span>
                                </td>
                                <td className="font-bold">{closure.totalCattle}</td>
                                <td>{(closure.closedBy as any)?.name || '---'}</td>
                                <td>{closure.closedAt ? formatDateBR(closure.closedAt) : '---'}</td>
                                <td>
                                    <div className="flex justify-center gap-2">
                                        <button 
                                            onClick={() => navigate(`/slaughter/closure/${closure.date.toString().substring(0, 10)}`)}
                                            className="action-btn" title="Visualizar"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        {closure.status === 'CLOSED' && (
                                            <>
                                                <button className="action-btn text-indigo-500" title="Baixar PDF">
                                                    <Download size={18} />
                                                </button>
                                                <button className="action-btn text-green-500" title="Baixar XLSM">
                                                    <Download size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
