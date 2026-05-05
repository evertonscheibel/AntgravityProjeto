import React, { useEffect, useState } from 'react';
import { maintenanceService } from '../services';
import { Plus, Search, Filter, Calendar, Clock, CheckCircle, AlertCircle, Eye, Wrench } from 'lucide-react';
import { MaintenanceList } from '../components/MaintenanceList';
import { MaintenanceModal } from '../components/MaintenanceModal';
import '../pages/Tickets.css';

export const Maintenances: React.FC = () => {
    const [maintenances, setMaintenances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState<any | null>(null);

    useEffect(() => {
        loadMaintenances();
    }, [filterStatus]);

    const loadMaintenances = async () => {
        setLoading(true);
        try {
            const params = filterStatus ? { status: filterStatus } : {};
            const response = await maintenanceService.getAll(params);
            setMaintenances(response.data);
        } catch (error) {
            console.error('Erro ao carregar manutenções:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (maintenance: any) => {
        setSelectedMaintenance(maintenance);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Excluir esta manutenção?')) return;
        try {
            await maintenanceService.delete(id);
            loadMaintenances();
        } catch (error) {
            console.error('Erro ao excluir:', error);
        }
    };

    const filteredMaintenances = maintenances.filter(m =>
        m.asset?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.osNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading-container"><div className="spinner"></div><p>Carregando manutenções...</p></div>;

    return (
        <div className="tickets-page">
            <div className="page-header">
                <div>
                    <h1>Manutenções (O.S.)</h1>
                    <p>{filteredMaintenances.length} ordem(ns) encontrada(s)</p>
                </div>
                <button className="btn-primary" onClick={() => { setSelectedMaintenance(null); setShowModal(true); }}>
                    <Plus size={20} /> Nova O.S.
                </button>
            </div>

            <div className="tickets-toolbar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por O.S., ativo ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
                    <option value="">Todos os Status</option>
                    <option value="scheduled">Agendado</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="completed">Concluído</option>
                    <option value="canceled">Cancelado</option>
                </select>
            </div>

            <div className="tickets-table-container">
                <MaintenanceList
                    maintenances={filteredMaintenances}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            {showModal && (
                <MaintenanceModal
                    maintenance={selectedMaintenance}
                    onClose={() => setShowModal(false)}
                    onSave={loadMaintenances}
                />
            )}
        </div>
    );
};
