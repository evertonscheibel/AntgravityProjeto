import React, { useEffect, useState, useRef } from 'react';
import { assetService, maintenanceService } from '../services';
import { Plus, Search, Edit, Trash2, Wrench, Clock, Upload, Download, FileSpreadsheet } from 'lucide-react';
import { AssetModal } from '../components/AssetModal';
import { MaintenanceModal } from '../components/MaintenanceModal';
import { AssetTimelineModal } from '../components/AssetTimelineModal';
import { MaintenanceList } from '../components/MaintenanceList';
import '../pages/Tickets.css';

export const Assets: React.FC = () => {
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showTimelineModal, setShowTimelineModal] = useState(false);
    const [showMaintenanceList, setShowMaintenanceList] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
    const [selectedMaintenance, setSelectedMaintenance] = useState<any | null>(null);
    const [maintenances, setMaintenances] = useState<any[]>([]);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        try {
            const data = await assetService.getAll();
            setAssets(data);
        } catch (error) {
            console.error('Erro ao carregar ativos:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMaintenances = async (assetId: string) => {
        try {
            const response = await maintenanceService.getByAsset(assetId);
            setMaintenances(response.data);
        } catch (error) {
            console.error('Erro ao carregar manutenções:', error);
        }
    };

    const handleCreateAsset = () => {
        setSelectedAsset(null);
        setShowAssetModal(true);
    };

    const handleEditAsset = (asset: any) => {
        setSelectedAsset(asset);
        setShowAssetModal(true);
    };

    const handleDeleteAsset = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este ativo?')) return;

        try {
            await assetService.delete(id);
            loadAssets();
        } catch (error) {
            console.error('Erro ao excluir ativo:', error);
            alert('Erro ao excluir ativo');
        }
    };

    const handleNewMaintenance = (asset: any) => {
        setSelectedAsset(asset);
        setSelectedMaintenance(null);
        setShowMaintenanceModal(true);
    };

    const handleViewTimeline = (asset: any) => {
        setSelectedAsset(asset);
        setShowTimelineModal(true);
    };

    const handleViewMaintenances = async (asset: any) => {
        setSelectedAsset(asset);
        await loadMaintenances(asset._id);
        setShowMaintenanceList(true);
    };

    const handleEditMaintenance = (maintenance: any) => {
        setSelectedMaintenance(maintenance);
        setShowMaintenanceModal(true);
    };

    const handleDeleteMaintenance = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta manutenção?')) return;

        try {
            await maintenanceService.delete(id);
            if (selectedAsset) {
                await loadMaintenances(selectedAsset._id);
            }
        } catch (error) {
            console.error('Erro ao excluir manutenção:', error);
            alert('Erro ao excluir manutenção');
        }
    };

    const handleSave = () => {
        loadAssets();
    };

    const handleMaintenanceSave = async () => {
        if (selectedAsset) {
            await loadMaintenances(selectedAsset._id);
        }
    };

    const handleExport = async () => {
        try {
            const blob = await assetService.exportAssets();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ativos_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Erro ao exportar ativos:', error);
            alert('Erro ao exportar ativos');
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await assetService.importAssets(formData);
            alert(`Importação concluída!\nSucesso: ${response.results.success}\nErros: ${response.results.errors}`);
            loadAssets();
        } catch (error) {
            console.error('Erro ao importar ativos:', error);
            alert('Erro ao importar ativos. Verifique se o arquivo é um Excel válido.');
        } finally {
            setImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const filteredAssets = assets.filter(asset =>
        asset.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div><p>Carregando ativos...</p></div>;
    }

    return (
        <div className="tickets-page">
            <div className="page-header">
                <div>
                    <h1>Gestão de Ativos</h1>
                    <p>{filteredAssets.length} ativo(s) encontrado(s)</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                    />
                    <button
                        className="btn-secondary"
                        onClick={handleImportClick}
                        disabled={importing}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569' }}
                    >
                        {importing ? <div className="spinner-small"></div> : <Upload size={18} />}
                        Importar Excel
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={handleExport}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569' }}
                    >
                        <Download size={18} />
                        Exportar Excel
                    </button>
                    <button className="btn-primary" onClick={handleCreateAsset}>
                        <Plus size={20} />
                        Novo Ativo
                    </button>
                </div>
            </div>

            <div className="tickets-toolbar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar ativos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="tickets-table-container">
                <table className="tickets-table">
                    <thead>
                        <tr>
                            <th>ID do Ativo</th>
                            <th>Descrição</th>
                            <th>Tipo</th>
                            <th>Localização</th>
                            <th>Status</th>
                            <th>Responsável</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.map((asset) => (
                            <tr key={asset._id}>
                                <td><strong>{asset.assetId}</strong></td>
                                <td>{asset.description}</td>
                                <td>{asset.type || 'N/A'}</td>
                                <td>{asset.location || 'N/A'}</td>
                                <td>
                                    <span className="status-badge" style={{
                                        backgroundColor:
                                            asset.status === 'ativo' ? '#10b981' :
                                                asset.status === 'disponivel' ? '#3b82f6' :
                                                    asset.status === 'em_manutencao' ? '#f59e0b' : '#64748b'
                                    }}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td>{asset.assignedTo?.name || asset.responsible?.name || 'Não atribuído'}</td>
                                <td>
                                    <div className="action-buttons" style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleViewMaintenances(asset)}
                                            title="Ver Manutenções"
                                            style={{ background: '#f0f9ff', color: '#0369a1' }}
                                        >
                                            <Wrench size={16} />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleNewMaintenance(asset)}
                                            title="Nova Manutenção"
                                            style={{ background: '#f0fdf4', color: '#16a34a' }}
                                        >
                                            <Plus size={16} />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleViewTimeline(asset)}
                                            title="Ver Histórico"
                                            style={{ background: '#faf5ff', color: '#9333ea' }}
                                        >
                                            <Clock size={16} />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleEditAsset(asset)}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="btn-icon danger"
                                            onClick={() => handleDeleteAsset(asset._id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showAssetModal && (
                <AssetModal
                    asset={selectedAsset}
                    onClose={() => setShowAssetModal(false)}
                    onSave={handleSave}
                />
            )}

            {showMaintenanceModal && selectedAsset && (
                <MaintenanceModal
                    maintenance={selectedMaintenance}
                    assetId={selectedAsset._id}
                    onClose={() => {
                        setShowMaintenanceModal(false);
                        setSelectedMaintenance(null);
                    }}
                    onSave={handleMaintenanceSave}
                />
            )}

            {showTimelineModal && selectedAsset && (
                <AssetTimelineModal
                    assetId={selectedAsset._id}
                    assetName={`${selectedAsset.assetId} - ${selectedAsset.description}`}
                    onClose={() => setShowTimelineModal(false)}
                />
            )}

            {showMaintenanceList && selectedAsset && (
                <div className="modal-overlay" onClick={() => setShowMaintenanceList(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
                        <div className="modal-header">
                            <div>
                                <h2>Manutenções do Ativo</h2>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                                    {selectedAsset.assetId} - {selectedAsset.description}
                                </p>
                            </div>
                            <button className="close-btn" onClick={() => setShowMaintenanceList(false)}>
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '16px' }}>
                                <button
                                    onClick={() => {
                                        setShowMaintenanceList(false);
                                        handleNewMaintenance(selectedAsset);
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Plus size={16} /> Nova Manutenção
                                </button>
                            </div>
                            <MaintenanceList
                                maintenances={maintenances}
                                onEdit={handleEditMaintenance}
                                onDelete={handleDeleteMaintenance}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
