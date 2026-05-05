import React, { useState } from 'react';
import { Package } from 'lucide-react';
import BaseModal from './BaseModal';
import { purchaseRequestService } from '../services';

interface CreateAssetModalProps {
    requestId: string;
    requestNumber: string;
    requestTitle: string;
    requestValue: number;
    requestDepartment: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateAssetModal: React.FC<CreateAssetModalProps> = ({
    requestId,
    requestNumber,
    requestTitle,
    requestValue,
    requestDepartment,
    onClose,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        description: requestTitle,
        type: 'outro',
        brand: '',
        model: '',
        serialNumber: '',
        location: '',
        warrantyExpiration: '',
        assignedTo: '',
        notes: `Criado a partir da solicitação ${requestNumber}`
    });
    const [errors, setErrors] = useState<any>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors: any = {};
        if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
        if (!formData.type) newErrors.type = 'Tipo é obrigatório';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            const response = await purchaseRequestService.createAsset(requestId, formData);

            alert(`Ativo criado com sucesso! ID: ${response.data.assetId}`);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Erro ao criar ativo:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
            alert(`Erro ao criar ativo: ${errorMessage}`);
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
                onClick={() => handleSubmit()}
                style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <Package size={20} />
                {loading ? 'Criando...' : 'Finalizar e Criar Ativo'}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title="Integrar Ativo ao Patrimônio"
            footer={modalFooter}
        >
            <div style={{
                padding: '20px',
                background: '#f0fdf4',
                borderRadius: '16px',
                marginBottom: '24px',
                border: '1px solid #dcfce7',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
            }}>
                <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>Origem (Solicitação)</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#14532d' }}>{requestNumber}</div>
                </div>
                <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>Valor de Aquisição</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#16a34a' }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(requestValue)}
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label className="required">Descrição do Ativo</label>
                <input
                    type="text"
                    name="description"
                    className={errors.description ? 'field-error' : ''}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Ex: Notebook Dell Latitude 5420"
                />
                {errors.description && <span className="error-msg">{errors.description}</span>}
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label className="required">Tipo de Patrimônio</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
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
                        <option value="rede">🌐 Equipamento de Rede</option>
                        <option value="software">💾 Software</option>
                        <option value="outro">📦 Outro</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Fabricante / Marca</label>
                    <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        placeholder="Ex: Dell, HP, Lenovo, STIHL"
                    />
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label>Modelo</label>
                    <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        placeholder="Ex: Latitude 5420"
                    />
                </div>

                <div className="form-group">
                    <label>Número de Série</label>
                    <input
                        type="text"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        placeholder="Ex: SN123456789"
                    />
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label>Localização Inicial</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Ex: Almoxarifado, TI, Sede"
                    />
                </div>

                <div className="form-group">
                    <label>Fim da Garantia</label>
                    <input
                        type="date"
                        name="warrantyExpiration"
                        value={formData.warrantyExpiration}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Notas Internas</label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Observações adicionais para o inventário..."
                    style={{ resize: 'none' }}
                />
            </div>
        </BaseModal>
    );
};
