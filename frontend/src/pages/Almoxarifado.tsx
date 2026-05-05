import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Search, Box, ArrowUpRight, ArrowDownLeft, History, Package, AlertTriangle, Trash2, Edit, RefreshCw } from 'lucide-react';
import { almoxarifadoService } from '../services';
import ProductModal from '../components/ProductModal';
import MovementModal from '../components/MovementModal';
import '../pages/Tickets.css';

export const Almoxarifado: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [movements, setMovements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'estoque' | 'movimentacoes'>('estoque');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [showProductModal, setShowProductModal] = useState(false);
    const [showMovementModal, setShowMovementModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [prodRes, moveRes] = await Promise.all([
                almoxarifadoService.getProducts(),
                almoxarifadoService.getMovements()
            ]);
            setProducts(prodRes.data || []);
            setMovements(moveRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar Almoxarifado:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProduct = async (data: any) => {
        setActionLoading(true);
        try {
            if (selectedProduct) {
                await almoxarifadoService.updateProduct(selectedProduct._id, data);
            } else {
                await almoxarifadoService.createProduct(data);
            }
            setShowProductModal(false);
            loadData();
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveMovement = async (data: any) => {
        setActionLoading(true);
        try {
            await almoxarifadoService.createMovement(data);
            setShowMovementModal(false);
            loadData();
        } catch (error) {
            console.error('Erro ao registrar movimentação:', error);
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!window.confirm('Excluir este produto?')) return;
        try {
            await almoxarifadoService.deleteProduct(id);
            loadData();
        } catch (error) {
            alert('Erro ao excluir produto. Verifique se existem movimentações vinculadas.');
        }
    };

    if (loading && products.length === 0 && movements.length === 0) {
        return <div className="loading-container"><div className="spinner"></div><p>Carregando Almoxarifado...</p></div>;
    }

    return (
        <div className="tickets-page">
            <div className="page-header">
                <div>
                    <h1>Almoxarifado</h1>
                    <p>Controle de estoque e suprimentos</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className={`btn-tab ${activeTab === 'estoque' ? 'active' : ''}`} onClick={() => setActiveTab('estoque')}>
                        Estoque Atual
                    </button>
                    <button className={`btn-tab ${activeTab === 'movimentacoes' ? 'active' : ''}`} onClick={() => setActiveTab('movimentacoes')}>
                        Movimentações
                    </button>
                    <button
                        className="btn-primary"
                        style={{ marginLeft: '10px' }}
                        onClick={() => {
                            if (activeTab === 'estoque') {
                                setSelectedProduct(null);
                                setShowProductModal(true);
                            } else {
                                setShowMovementModal(true);
                            }
                        }}
                    >
                        <Plus size={20} /> {activeTab === 'estoque' ? 'Novo Produto' : 'Nova Movimentação'}
                    </button>
                </div>
            </div>

            <div className="tickets-toolbar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="tickets-table-container">
                <table className="tickets-table">
                    <thead>
                        {activeTab === 'estoque' ? (
                            <tr>
                                <th>Produto</th>
                                <th>Categoria</th>
                                <th>Quantidade</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        ) : (
                            <tr>
                                <th>Data</th>
                                <th>Produto</th>
                                <th>Tipo</th>
                                <th>Qtd</th>
                                <th>Responsável</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {activeTab === 'estoque' ? (
                            products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                <tr key={p._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Package size={18} color="#64748b" />
                                            <strong>{p.name}</strong>
                                        </div>
                                    </td>
                                    <td>{p.category}</td>
                                    <td>{p.quantity} {p.unit}</td>
                                    <td>
                                        {p.quantity <= p.minQuantity ? (
                                            <span className="status-badge" style={{ backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <AlertTriangle size={12} /> Baixo Estoque
                                            </span>
                                        ) : (
                                            <span className="status-badge" style={{ backgroundColor: '#10b981' }}>Estoque Ok</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon" title="Entrada/Saída" onClick={() => {
                                                setSelectedProduct(p);
                                                setShowMovementModal(true);
                                            }}>
                                                <RefreshCw size={16} />
                                            </button>
                                            <button className="btn-icon" title="Editar" onClick={() => {
                                                setSelectedProduct(p);
                                                setShowProductModal(true);
                                            }}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="btn-icon danger" onClick={() => handleDeleteProduct(p._id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            movements.filter(m => m.product?.name.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                                <tr key={m._id}>
                                    <td>{new Date(m.createdAt).toLocaleString()}</td>
                                    <td>{m.product?.name}</td>
                                    <td>
                                        <span className={`status-badge ${m.type === 'IN' ? 'success' : 'danger'}`} style={{ backgroundColor: m.type === 'IN' ? '#10b981' : '#ef4444' }}>
                                            {m.type === 'IN' ? 'Entrada' : 'Saída'}
                                        </span>
                                    </td>
                                    <td>{m.quantity} {m.product?.unit}</td>
                                    <td>{m.user?.name}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ProductModal
                isOpen={showProductModal}
                product={selectedProduct}
                onClose={() => setShowProductModal(false)}
                onSave={handleSaveProduct}
                loading={actionLoading}
            />

            <MovementModal
                isOpen={showMovementModal}
                products={products}
                onClose={() => setShowMovementModal(false)}
                onSave={handleSaveMovement}
                loading={actionLoading}
            />
        </div>
    );
};
