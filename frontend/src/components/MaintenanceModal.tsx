import React, { useState, useEffect } from 'react';
import { maintenanceService, userService, assetService, User } from '../services';
import { Plus, Trash2 } from 'lucide-react';
import BaseModal from './BaseModal';

interface MaintenanceModalProps {
    maintenance: any | null;
    assetId?: string;
    onClose: () => void;
    onSave: () => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ maintenance, assetId, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        asset: assetId || '',
        type: 'preventiva',
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        scheduledDate: '',
        status: 'agendada',
        priority: 'media',
        responsible: '',
        technician: '',
        laborCost: 0,
        notes: '',
        relatedTicket: ''
    });

    const [users, setUsers] = useState<User[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [parts, setParts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, assetsRes] = await Promise.all([
                    userService.getAll(),
                    assetService.getAll()
                ]);
                setUsers(usersRes.data || usersRes);
                setAssets(assetsRes.data || assetsRes);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (maintenance) {
            setFormData({
                asset: maintenance.asset?._id || assetId,
                type: maintenance.type || 'preventiva',
                title: maintenance.title || '',
                description: maintenance.description || '',
                startDate: maintenance.startDate ? maintenance.startDate.split('T')[0] : '',
                endDate: maintenance.endDate ? maintenance.endDate.split('T')[0] : '',
                scheduledDate: maintenance.scheduledDate ? maintenance.scheduledDate.split('T')[0] : '',
                status: maintenance.status || 'agendada',
                priority: maintenance.priority || 'media',
                responsible: maintenance.responsible?._id || maintenance.responsible || '',
                technician: maintenance.technician?._id || maintenance.technician || '',
                laborCost: maintenance.laborCost || 0,
                notes: maintenance.notes || '',
                relatedTicket: maintenance.relatedTicket?._id || ''
            });
            setParts(maintenance.parts || []);
        }
    }, [maintenance, assetId]);

    const addPart = () => {
        setParts([...parts, { name: '', partNumber: '', quantity: 1, unitCost: 0, supplier: '' }]);
    };

    const removePart = (index: number) => {
        setParts(parts.filter((_, i) => i !== index));
    };

    const updatePart = (index: number, field: string, value: any) => {
        const newParts = [...parts];
        newParts[index] = { ...newParts[index], [field]: value };
        setParts(newParts);
    };

    const calculateTotalCost = () => {
        const partsCost = parts.reduce((total, part) => total + (part.quantity * part.unitCost), 0);
        return partsCost + (formData.laborCost || 0);
    };

    const validate = () => {
        const newErrors: any = {};
        if (!formData.asset) newErrors.asset = 'Ativo é obrigatório';
        if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
        if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
        if (!formData.type) newErrors.type = 'Tipo é obrigatório';
        if (!formData.responsible) newErrors.responsible = 'Responsável é obrigatório';
        if (!formData.startDate) newErrors.startDate = 'Data de início é obrigatória';

        // Validar peças
        if (parts.length > 0) {
            const partErrors = parts.some(p => !p.name.trim());
            if (partErrors) newErrors.parts = 'Nome da peça é obrigatório para todos os itens';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            const dataToSend: any = { ...formData, parts };
            if (!dataToSend.startDate) delete dataToSend.startDate;
            if (!dataToSend.endDate) delete dataToSend.endDate;
            if (!dataToSend.scheduledDate) delete dataToSend.scheduledDate;
            if (!dataToSend.responsible) delete dataToSend.responsible;
            if (!dataToSend.technician) delete dataToSend.technician;

            if (maintenance) {
                await maintenanceService.update(maintenance._id, dataToSend);
            } else {
                await maintenanceService.create(dataToSend);
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar manutenção:', error);
            alert('Erro ao salvar manutenção');
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
                {loading ? 'Salvando...' : maintenance ? 'Atualizar' : 'Criar Manutenção'}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title={maintenance ? 'Editar Manutenção' : 'Nova Manutenção'}
            footer={modalFooter}
            maxWidth="900px"
        >
            <div className="form-group">
                <label className="required">Ativo / Patrimônio</label>
                <select
                    value={formData.asset}
                    onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                    className={errors.asset ? 'field-error' : ''}
                    disabled={!!assetId}
                >
                    <option value="">Selecionar Ativo...</option>
                    {assets.map(a => (
                        <option key={a._id} value={a._id}>{a.assetId} - {a.description}</option>
                    ))}
                </select>
                {errors.asset && <span className="error-msg">{errors.asset}</span>}
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label className="required">Tipo</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className={errors.type ? 'field-error' : ''}
                    >
                        <option value="preventiva">Preventiva</option>
                        <option value="corretiva">Corretiva</option>
                        <option value="preditiva">Preditiva</option>
                        <option value="emergencial">Emergencial</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="required">Prioridade</label>
                    <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}>
                        <option value="baixa">🟢 Baixa</option>
                        <option value="media">🟡 Média</option>
                        <option value="alta">🟠 Alta</option>
                        <option value="critica">🔴 Crítica</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="required">Título</label>
                <input
                    type="text"
                    className={errors.title ? 'field-error' : ''}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Troca de óleo / Revisão 500h"
                />
                {errors.title && <span className="error-msg">{errors.title}</span>}
            </div>

            <div className="form-group">
                <label className="required">Descrição</label>
                <textarea
                    className={errors.description ? 'field-error' : ''}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Descreva o que será/foi feito..."
                />
                {errors.description && <span className="error-msg">{errors.description}</span>}
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label>Data Agendada</label>
                    <input type="date" value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} />
                </div>

                <div className="form-group">
                    <label>Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                        <option value="agendada">Agendada</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="concluida">Concluída</option>
                        <option value="cancelada">Cancelada</option>
                    </select>
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label className="required">Data de Início</label>
                    <input 
                        type="date" 
                        value={formData.startDate} 
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className={errors.startDate ? 'field-error' : ''} 
                    />
                    {errors.startDate && <span className="error-msg">{errors.startDate}</span>}
                </div>

                <div className="form-group">
                    <label>Data de Conclusão</label>
                    <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
            </div>

            <div className="form-row-2">
                <div className="form-group">
                    <label className="required">Responsável</label>
                    <select 
                        value={formData.responsible} 
                        onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                        className={errors.responsible ? 'field-error' : ''}
                    >
                        <option value="">Selecionar...</option>
                        {users.map(u => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                    </select>
                    {errors.responsible && <span className="error-msg">{errors.responsible}</span>}
                </div>

                <div className="form-group">
                    <label>Técnico / Executor</label>
                    <select value={formData.technician} onChange={(e) => setFormData({ ...formData, technician: e.target.value })}>
                        <option value="">Selecionar...</option>
                        {users.map(u => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>Custo de Mão de Obra (R$)</label>
                <input type="number" step="0.01" value={formData.laborCost} onChange={(e) => setFormData({ ...formData, laborCost: parseFloat(e.target.value) || 0 })} />
            </div>

            <div style={{ marginTop: '24px', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Peças e Insumos</h3>
                    <button type="button" onClick={addPart} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
                        <Plus size={16} /> Adicionar Item
                    </button>
                </div>

                {parts.map((part, index) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '10px', marginBottom: '10px' }}>
                        <input type="text" placeholder="Peça/Insumo" value={part.name} onChange={(e) => updatePart(index, 'name', e.target.value)} />
                        <input type="text" placeholder="Ref/PN" value={part.partNumber} onChange={(e) => updatePart(index, 'partNumber', e.target.value)} />
                        <input type="number" placeholder="Qtd" value={part.quantity} onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)} />
                        <input type="number" step="0.01" placeholder="R$ Unit" value={part.unitCost} onChange={(e) => updatePart(index, 'unitCost', parseFloat(e.target.value) || 0)} />
                        <button type="button" onClick={() => removePart(index)} style={{ padding: '8px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                <div style={{ marginTop: '12px', textAlign: 'right', padding: '12px', background: '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#ef4444', fontSize: '14px' }}>
                        {errors.parts && <span>{errors.parts}</span>}
                    </div>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>Total: R$ {calculateTotalCost().toFixed(2)}</span>
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Observações</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Detalhes adicionais..." />
            </div>
        </BaseModal>
    );
};
