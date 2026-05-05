import React, { useEffect, useState } from 'react';
import { assetService } from '../services';
import { Asset } from '../types/asset';
import { NetworkAssetModal } from '../components/NetworkAssetModal';
import { Plus, Search, Edit, Power, Wifi, Server, Shield, Activity } from 'lucide-react';
import './Tickets.css'; // Reusing styles

export const NetworkAssets: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        setLoading(true);
        try {
            const data = await assetService.getAll({ category: 'network' });
            setAssets(data);
        } catch (error) {
            console.error('Erro ao carregar ativos de rede:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedAsset(null);
        setShowModal(true);
    };

    const handleEdit = (asset: Asset) => {
        setSelectedAsset(asset);
        setShowModal(true);
    };

    const handleToggleActive = async (asset: Asset) => {
        if (!asset.network) return;
        const newStatus = !asset.isActive;
        const action = newStatus ? 'ativar' : 'inativar';

        if (!window.confirm(`Deseja realmente ${action} o ativo ${asset.network.hostname || asset.assetId}?`)) return;

        try {
            // Assumindo que o serviço tem um método genérico ou endpoint específico
            // Como criamos a rota PATCH toggle-active, precisamos chamar ela.
            // O assetService padrão pode não ter esse método específico mapeado ainda, 
            // então vamos usar o método update ou chamar via api direta se necessário.
            // Mas vamos adicionar ao serviço dinamicamente ou extender.
            // Por enquanto, vou usar o update, mas o ideal seria o endpoint específico.
            // Vou usar axios diretamente aqui ou um cast se o typescript reclamar.

            // Melhor: usar o endpoint correto
            // Como não alterei o assetService no frontend, vou usar o api.patch se possível, 
            // mas o api não está exportado aqui. 
            // Workaround: vou usar o assetService.update se o backend suportar toggle no update, 
            // MAS o backend tem uma rota específica. 
            // Vou chamar o assetService.toggleActive se eu tivesse criado.
            // Como não criei, vou criar uma função local auxiliar que usa o api importado ou fetch.
            // Vou assumir que vou adicionar ao service depois ou usar fetch.

            // Usando fetch nativo com token por enquanto para garantir
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/assets/${asset._id}/toggle-active`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: newStatus })
            });

            if (response.ok) {
                loadAssets();
            } else {
                throw new Error('Falha ao alterar status');
            }
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            alert('Erro ao alterar status do ativo');
        }
    };

    const getDeviceIcon = (type?: string) => {
        switch (type) {
            case 'switch': return <Server size={18} />;
            case 'router': return <Activity size={18} />;
            case 'ap': return <Wifi size={18} />;
            case 'firewall': return <Shield size={18} />;
            default: return <Server size={18} />;
        }
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch =
            asset.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.network?.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.network?.mgmtIp?.includes(searchTerm);

        const matchesStatus = statusFilter === 'all'
            ? true
            : statusFilter === 'active' ? asset.isActive
                : !asset.isActive;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="tickets-page">
            <div className="page-header">
                <div>
                    <h1>Ativos de Rede</h1>
                    <p>Gerenciamento de infraestrutura de rede (Switches, Roteadores, APs)</p>
                </div>
                <button className="btn-primary" onClick={handleCreate}>
                    <Plus size={20} />
                    Novo Dispositivo
                </button>
            </div>

            <div className="tickets-toolbar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por Hostname, IP ou ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                    </select>
                </div>
            </div>

            <div className="tickets-table-container">
                <table className="tickets-table">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Hostname</th>
                            <th>IP Gerência</th>
                            <th>Fabricante/Modelo</th>
                            <th>Local</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Carregando...</td></tr>
                        ) : filteredAssets.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Nenhum ativo encontrado</td></tr>
                        ) : (
                            filteredAssets.map((asset) => (
                                <tr key={asset._id} style={{ opacity: asset.isActive ? 1 : 0.6 }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {getDeviceIcon(asset.network?.deviceType)}
                                            <span style={{ textTransform: 'capitalize' }}>{asset.network?.deviceType}</span>
                                        </div>
                                    </td>
                                    <td><strong>{asset.network?.hostname || '-'}</strong></td>
                                    <td>{asset.network?.mgmtIp || '-'}</td>
                                    <td>{asset.brand} {asset.model}</td>
                                    <td>{asset.location || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${asset.isActive ? 'active' : 'inactive'}`}
                                            style={{
                                                backgroundColor: asset.isActive ? '#dcfce7' : '#f1f5f9',
                                                color: asset.isActive ? '#166534' : '#64748b'
                                            }}
                                        >
                                            {asset.isActive ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleEdit(asset)}
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleToggleActive(asset)}
                                                title={asset.isActive ? "Inativar" : "Ativar"}
                                                style={{ color: asset.isActive ? '#ef4444' : '#10b981' }}
                                            >
                                                <Power size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <NetworkAssetModal
                    asset={selectedAsset}
                    onClose={() => setShowModal(false)}
                    onSave={loadAssets}
                />
            )}
        </div>
    );
};
