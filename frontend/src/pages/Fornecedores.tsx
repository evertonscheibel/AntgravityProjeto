import React, { useState, useEffect } from 'react';
import { fornecedorService, fazendaService } from '../services';
import {
    Plus, Search, Filter, Building2, MapPin,
    Star, Shield, ShieldAlert, MoreVertical,
    Phone, Mail, Globe, ExternalLink
} from 'lucide-react';
import { FornecedorModal } from '../components/FornecedorModal';
import { toast } from 'react-toastify';
import './Fornecedores.css';

export const Fornecedores: React.FC = () => {
    const [fornecedores, setFornecedores] = useState<any[]>([]);
    const [fazendas, setFazendas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');
    const [filterFazenda, setFilterFazenda] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [selectedFornecedor, setSelectedFornecedor] = useState<any | null>(null);

    useEffect(() => {
        loadData();
    }, [filterStatus, filterCategoria, filterFazenda]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filterStatus) params.status = filterStatus;
            if (filterCategoria) params.categoria = filterCategoria;
            if (filterFazenda) params.fazenda = filterFazenda;

            const [fornRes, fazRes] = await Promise.all([
                fornecedorService.getAll(params),
                fazendaService.getAll()
            ]);

            setFornecedores(fornRes.data || []);
            setFazendas(fazRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            toast.error('Erro ao carregar fornecedores');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ativo' ? 'bloqueado' : 'ativo';
        try {
            await fornecedorService.updateStatus(id, newStatus);
            toast.success(`Fornecedor ${newStatus === 'ativo' ? 'ativado' : 'bloqueado'}`);
            loadData();
        } catch (error) {
            toast.error('Erro ao atualizar status');
        }
    };

    const deleteFornecedor = async (id: string) => {
        if (!window.confirm('Excluir este fornecedor permanentemente?')) return;
        try {
            // Assuming we might need delete in service eventually, but for now we follow spec
            // For now, let's just use update status to 'bloqueado' or 'inativo' if delete not in spec endpoints
            await fornecedorService.updateStatus(id, 'inativo');
            toast.success('Fornecedor desativado');
            loadData();
        } catch (error) {
            toast.error('Erro ao desativar fornecedor');
        }
    };

    const filteredFornecedores = fornecedores.filter(f =>
        f.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.cnpj_cpf?.includes(searchTerm)
    );

    const renderStars = (nota: number) => {
        return (
            <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        size={14}
                        fill={star <= Math.round(nota) ? "#f59e0b" : "transparent"}
                        color={star <= Math.round(nota) ? "#f59e0b" : "#d1d5db"}
                    />
                ))}
                <span className="rating-value">{nota.toFixed(1)}</span>
            </div>
        );
    };

    const getStatusBadge = (status: string) => {
        const configs: any = {
            ativo: { color: '#10b981', label: 'Ativo' },
            inativo: { color: '#64748b', label: 'Inativo' },
            bloqueado: { color: '#ef4444', label: 'Bloqueado' },
            em_analise: { color: '#f59e0b', label: 'Em Análise' }
        };
        const config = configs[status] || configs.em_analise;
        return (
            <span className="status-badge" style={{ backgroundColor: config.color }}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="fornecedores-page">
            <div className="page-header">
                <div>
                    <h1>Gestão de Fornecedores</h1>
                    <p>{filteredFornecedores.length} fornecedores cadastrados</p>
                </div>
                <button className="btn-primary" onClick={() => { setSelectedFornecedor(null); setShowModal(true); }}>
                    <Plus size={20} /> Novo Fornecedor
                </button>
            </div>

            <div className="toolbar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou documento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filters">
                    <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}>
                        <option value="">Categorias</option>
                        <option value="insumos_agricolas">Insumos Agrícolas</option>
                        <option value="combustivel_lubrificantes">Combustível</option>
                        <option value="pecas_maquinario">Peças</option>
                        <option value="manutencao_servicos">Serviços</option>
                    </select>

                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">Status</option>
                        <option value="ativo">Ativo</option>
                        <option value="bloqueado">Bloqueado</option>
                        <option value="em_analise">Em Análise</option>
                    </select>

                    <select value={filterFazenda} onChange={(e) => setFilterFazenda(e.target.value)}>
                        <option value="">Fazenda</option>
                        {fazendas.map(faz => (
                            <option key={faz._id} value={faz._id}>{faz.nome}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Carregando fornecedores...</p>
                </div>
            ) : (
                <div className="fornecedores-grid">
                    {filteredFornecedores.map(f => (
                        <div key={f._id} className="fornecedor-card">
                            <div className="card-header">
                                <div className="company-info">
                                    <div className="avatar">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h3>{f.nome_fantasia || f.razao_social}</h3>
                                        <span className="document">{f.cnpj_cpf}</span>
                                    </div>
                                </div>
                                {getStatusBadge(f.status)}
                            </div>

                            <div className="card-body">
                                <div className="info-row">
                                    <MapPin size={16} />
                                    <span>{f.endereco?.municipio} - {f.endereco?.estado}</span>
                                </div>
                                <div className="info-row">
                                    <Shield size={16} />
                                    <div className="categories">
                                        {f.categorias?.slice(0, 2).map((cat: string) => (
                                            <span key={cat} className="cat-tag">{cat.replace('_', ' ')}</span>
                                        ))}
                                        {f.categorias?.length > 2 && <span className="cat-tag">+{f.categorias.length - 2}</span>}
                                    </div>
                                </div>

                                <div className="stats-row">
                                    <div className="stat">
                                        <label>Avaliação</label>
                                        {renderStars(f.avaliacao?.nota_geral || 0)}
                                    </div>
                                    <div className="stat">
                                        <label>Pedidos</label>
                                        <strong>{f.total_pedidos || 0}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="card-footer">
                                <button className="btn-icon" title="Editar" onClick={() => { setSelectedFornecedor(f); setShowModal(true); }}>
                                    <MoreVertical size={18} />
                                </button>
                                <div className="actions">
                                    <button
                                        className={`btn-action ${f.status === 'bloqueado' ? 'unblock' : 'block'}`}
                                        onClick={() => handleStatusUpdate(f._id, f.status)}
                                    >
                                        {f.status === 'bloqueado' ? 'Desbloquear' : 'Bloquear'}
                                    </button>
                                    <button className="btn-view">Ver Ficha</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <FornecedorModal
                    fornecedor={selectedFornecedor}
                    onClose={() => setShowModal(false)}
                    onSave={() => loadData()}
                />
            )}
        </div>
    );
};
