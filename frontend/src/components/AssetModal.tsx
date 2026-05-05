import React, { useState, useEffect } from 'react';
import { assetService, userService, User } from '../services';
import BaseModal from './BaseModal';

interface AssetModalProps {
    asset: any | null;
    onClose: () => void;
    onSave: () => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({ asset, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        assetId: '',
        description: '',
        type: 'computador',

        brand: '',
        model: '',
        serialNumber: '',
        purchaseDate: '',
        warrantyExpiration: '',
        status: 'ativo',
        location: '',
        assignedTo: ''
    });
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await userService.getAll();
                setUsers(response.data || response);
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (asset) {
            setFormData({
                assetId: asset.assetId || '',
                description: asset.description || '',
                type: asset.type || 'notebook',
                brand: asset.brand || '',
                model: asset.model || '',
                serialNumber: asset.serialNumber || '',
                purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
                warrantyExpiration: asset.warrantyExpiration ? asset.warrantyExpiration.split('T')[0] : '',
                status: asset.status || 'ativo',
                location: asset.location || '',
                assignedTo: asset.assignedTo?._id || asset.assignedTo || ''
            });
        }
    }, [asset]);

    const validate = () => {
        const newErrors: any = {};
        if (!formData.assetId.trim()) newErrors.assetId = 'ID do Ativo é obrigatório';
        if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
        if (!formData.type) newErrors.type = 'Tipo é obrigatório';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            const dataToSend: any = { ...formData };
            if (!dataToSend.purchaseDate) delete dataToSend.purchaseDate;
            if (!dataToSend.warrantyExpiration) delete dataToSend.warrantyExpiration;
            if (!dataToSend.assignedTo) delete dataToSend.assignedTo;

            if (asset) {
                await assetService.update(asset._id, dataToSend);
            } else {
                await assetService.create(dataToSend);
            }

            onSave();
            onClose();
        } catch (error: any) {
            console.error('Erro ao salvar ativo:', error);
            const message = error.response?.data?.message || error.response?.data?.error || 'Erro ao salvar ativo';
            alert(`Erro ao salvar ativo: ${message}`);
        } finally {
            setLoading(false);
        }
    };

    const modalFooter = (
        <>
            <button type="button" className="btn-secondary" onClick={onClose}>
                Cancelar
            </button>
            <button
                type="button"
                className="btn-primary"
                disabled={loading}
                onClick={handleSubmit}
                style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Salvando...' : asset ? 'Atualizar Ativo' : 'Criar Ativo'}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title={asset ? 'Editar Ativo' : 'Novo Ativo'}
            footer={modalFooter}
        >
            <div className="form-row-2">
                <div className="form-group">
                    <label className="required">ID do Ativo (Patrimônio)</label>
                    <input
                        type="text"
                        className={errors.assetId ? 'field-error' : ''}
                        value={formData.assetId}
                        onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                        placeholder="Ex: NB-001"
                    />
                    {errors.assetId && <span className="error-msg">{errors.assetId}</span>}
                </div>

                <div className="form-group">
                    <label className="required">Tipo</label>
                    <select
                        className={errors.type ? 'field-error' : ''}
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="trator">🚜 Trator</option>
                        <option value="colheitadeira">🌾 Colheitadeira</option>
                        <option value="plantadeira">🌱 Plantadeira</option>
                        <option value="pulverizador">🚿 Pulverizador</option>
                        <option value="implemento">🛠️ Implemento Agrícola</option>
                        <option value="veiculo">🚚 Veículo / Utilitário</option>
                        <option value="irrigacao">💧 Sistema de Irrigação</option>
                        <option value="silo">🏗️ Silo / Armazenagem</option>
                        <option value="drone">🚁 Drone / Monitoramento</option>
                        <option value="infraestrutura">🧱 Infraestrutura</option>
                        <option value="computador">💻 Computador / TI</option>
                        <option value="notebook">📓 Notebook</option>
                        <option value="rede">🌐 Equipamento de Rede</option>

                        <option value="software">💾 Software</option>
                        <option value="outro">📦 Outro</option>
                    </select>
                    {errors.type && <span className="error-msg">{errors.type}</span>}
                </div>
            </div>

            <div className="form-group">
                <label className="required">Descrição</label>
                <input
                    type="text"
                    className={errors.description ? 'field-error' : ''}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Notebook Dell Latitude 5420"
                />
                {errors.description && <span className="error-msg">{errors.description}</span>}
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label>Marca</label>
                    <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Ex: Dell"
                    />
                </div>

                <div className="form-group">
                    <label>Modelo</label>
                    <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="Ex: Latitude 5420"
                    />
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label>Número de Série</label>
                    <input
                        type="text"
                        value={formData.serialNumber}
                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                        placeholder="Service Tag / Serial"
                    />
                </div>

                <div className="form-group">
                    <label>Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="ativo">Ativo</option>
                        <option value="em_manutencao">Em Manutenção</option>
                        <option value="disponivel">Disponível (Estoque)</option>
                        <option value="descartado">Descartado</option>
                        <option value="perdido">Perdido/Roubado</option>
                    </select>
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label>Localização</label>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ex: Escritório SP - Mesa 12"
                    />
                </div>

                <div className="form-group">
                    <label>Responsável</label>
                    <select
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    >
                        <option value="">Selecionar responsável...</option>
                        {users.map(u => (
                            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label>Data de Compra</label>
                    <input
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>Garantia Até</label>
                    <input
                        type="date"
                        value={formData.warrantyExpiration}
                        onChange={(e) => setFormData({ ...formData, warrantyExpiration: e.target.value })}
                    />
                </div>
            </div>
        </BaseModal>
    );
};
