import React, { useState, useEffect } from 'react';
import { assetService } from '../services';
import { Asset, NetworkFields } from '../types/asset';
import { Save, AlertCircle, Globe, Server, Cpu } from 'lucide-react';
import BaseModal from './BaseModal';

interface NetworkAssetModalProps {
    asset?: Asset | null;
    onClose: () => void;
    onSave: () => void;
}

export const NetworkAssetModal: React.FC<NetworkAssetModalProps> = ({ asset, onClose, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [uplinkCandidates, setUplinkCandidates] = useState<Asset[]>([]);

    const initialNetworkState: NetworkFields = {
        deviceType: 'switch',
        hostname: '',
        mgmtIp: '',
        mac: '',
        firmwareVersion: '',
        snmpEnabled: false,
        snmpVersion: 'v2c',
        uplinkDeviceAssetId: '',
        uplinkPort: '',
        vlans: [],
        notes: ''
    };

    const [formData, setFormData] = useState<Partial<Asset>>({
        assetId: '',
        description: '',
        brand: '',
        model: '',
        serialNumber: '',
        location: '',
        status: 'ativo',
        category: 'network',
        isActive: true,
        network: initialNetworkState
    });

    const [vlansInput, setVlansInput] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadUplinkCandidates();
        if (asset) {
            setFormData({
                ...asset,
                network: {
                    ...initialNetworkState,
                    ...asset.network,
                    uplinkDeviceAssetId: typeof asset.network?.uplinkDeviceAssetId === 'object'
                        ? (asset.network.uplinkDeviceAssetId as any)._id
                        : asset.network?.uplinkDeviceAssetId || ''
                }
            });
            if (asset.network?.vlans) {
                setVlansInput(asset.network.vlans.join(', '));
            }
        } else {
            setFormData(prev => ({ ...prev, assetId: `NET-${Date.now().toString().slice(-4)}` }));
        }
    }, [asset]);

    const loadUplinkCandidates = async () => {
        try {
            const assets = await assetService.getAll({ category: 'network' });
            const filtered = assets.filter((a: Asset) => !asset || a._id !== asset._id);
            setUplinkCandidates(filtered);
        } catch (err) {
            console.error('Erro ao carregar candidatos a uplink', err);
        }
    };

    const handleNetworkChange = (field: keyof NetworkFields, value: any) => {
        setFormData(prev => ({
            ...prev,
            network: {
                ...prev.network!,
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!formData.network?.deviceType) {
                throw new Error('Tipo de dispositivo é obrigatório.');
            }

            const payload = {
                ...formData,
                network: {
                    ...formData.network,
                    vlans: vlansInput.split(',').map(v => v.trim()).filter(v => v)
                }
            };

            if (!payload.network?.uplinkDeviceAssetId) {
                delete payload.network?.uplinkDeviceAssetId;
            }

            if (asset?._id) {
                await assetService.update(asset._id, payload);
            } else {
                await assetService.create(payload);
            }

            onSave();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Erro ao salvar ativo de rede');
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
                    background: '#2563eb',
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
                <Save size={18} />
                {loading ? 'Salvando...' : 'Salvar Ativo de Rede'}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title={asset ? 'Editar Ativo de Rede' : 'Novo Ativo de Rede'}
            footer={modalFooter}
            maxWidth="900px"
        >
            {error && (
                <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    color: '#991b1b',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px'
                }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Coluna 1: Dados Gerais */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#1e293b' }}>
                        <Server size={18} color="#64748b" />
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dados do Hardware</h3>
                    </div>

                    <div className="form-group">
                        <label className="required">Hostname / Patrimônio</label>
                        <input
                            value={formData.assetId}
                            onChange={e => setFormData({ ...formData, assetId: e.target.value })}
                            placeholder="ex: SW-CORE-01"
                        />
                    </div>

                    <div className="form-group">
                        <label className="required">Descrição</label>
                        <input
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="ex: Switch Principal Rack 01"
                        />
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label>Fabricante</label>
                            <input
                                value={formData.brand}
                                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                placeholder="ex: Cisco, Ubiquiti"
                            />
                        </div>
                        <div className="form-group">
                            <label>Modelo</label>
                            <input
                                value={formData.model}
                                onChange={e => setFormData({ ...formData, model: e.target.value })}
                                placeholder="ex: Catalyst 2960"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Localização Física</label>
                        <input
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            placeholder="ex: CPD Sede - Rack A"
                        />
                    </div>
                </div>

                {/* Coluna 2: Configurações Lógicas */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#1e293b' }}>
                        <Globe size={18} color="#64748b" />
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configuração Lógica</h3>
                    </div>

                    <div className="form-group">
                        <label className="required">Tipo de Dispositivo</label>
                        <select
                            value={formData.network?.deviceType}
                            onChange={e => handleNetworkChange('deviceType', e.target.value)}
                        >
                            <option value="switch">🖥️ Switch</option>
                            <option value="router">📡 Roteador</option>
                            <option value="ap">📶 Access Point</option>
                            <option value="firewall">🛡️ Firewall</option>
                            <option value="modem">🔌 Modem</option>
                            <option value="nvr">📹 NVR / Câmeras</option>
                            <option value="other">📦 Outro</option>
                        </select>
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label>IP de Gerência</label>
                            <input
                                value={formData.network?.mgmtIp}
                                onChange={e => handleNetworkChange('mgmtIp', e.target.value)}
                                placeholder="192.168.1.1"
                            />
                        </div>
                        <div className="form-group">
                            <label>Versão Firmware</label>
                            <input
                                value={formData.network?.firmwareVersion}
                                onChange={e => handleNetworkChange('firmwareVersion', e.target.value)}
                                placeholder="v1.2.3"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>VLANs Ativas (separar por vírgula)</label>
                        <input
                            value={vlansInput}
                            onChange={e => setVlansInput(e.target.value)}
                            placeholder="1, 10, 20, 100"
                        />
                    </div>

                    <div className="form-group">
                        <label>Uplink / Cascata (Conectado a)</label>
                        <select
                            value={formData.network?.uplinkDeviceAssetId as string}
                            onChange={e => handleNetworkChange('uplinkDeviceAssetId', e.target.value)}
                        >
                            <option value="">Nenhum (Dispositivo Core)</option>
                            {uplinkCandidates.map(c => (
                                <option key={c._id} value={c._id}>
                                    {c.assetId} - {c.description} ({c.network?.mgmtIp})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Cpu size={16} color="#64748b" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>PROTOCOLO SNMP</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                        <input
                            type="checkbox"
                            checked={formData.network?.snmpEnabled}
                            onChange={e => handleNetworkChange('snmpEnabled', e.target.checked)}
                            style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Habilitar Monitoramento SNMP</span>
                    </label>

                    {formData.network?.snmpEnabled && (
                        <select
                            value={formData.network?.snmpVersion}
                            onChange={e => handleNetworkChange('snmpVersion', e.target.value)}
                            style={{ width: 'auto', padding: '6px 12px' }}
                        >
                            <option value="v2c">v2c (Comunidade)</option>
                            <option value="v3">v3 (Seguro)</option>
                        </select>
                    )}
                </div>
            </div>
        </BaseModal>
    );
};
