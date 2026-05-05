import React, { useState, useEffect } from 'react';
import BaseModal from '../BaseModal';
import { SlaughterPreLot } from '../../types/slaughter';

interface SlaughterLotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (lot: Partial<SlaughterPreLot>) => void;
    lot?: SlaughterPreLot;
}

const SlaughterLotModal: React.FC<SlaughterLotModalProps> = ({ isOpen, onClose, onSave, lot }) => {
    const [formData, setFormData] = useState<Partial<SlaughterPreLot>>({
        producerName: '',
        municipio: '',
        uf: '',
        brokerCode: '',
        boi: 0,
        vaca: 0,
        novilha: 0,
        bubalino: 0,
        touro: 0,
        total: 0
    });

    useEffect(() => {
        if (lot) {
            setFormData(lot);
        } else {
            setFormData({
                producerName: '',
                municipio: '',
                uf: '',
                brokerCode: '',
                boi: 0,
                vaca: 0,
                novilha: 0,
                bubalino: 0,
                touro: 0,
                total: 0
            });
        }
    }, [lot, isOpen]);

    const calculateTotal = (data: Partial<SlaughterPreLot>) => {
        return (Number(data.boi) || 0) + 
               (Number(data.vaca) || 0) + 
               (Number(data.novilha) || 0) + 
               (Number(data.bubalino) || 0) + 
               (Number(data.touro) || 0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? Number(value) : value;
        const newData = { ...formData, [name]: val };
        
        if (type === 'number') {
            newData.total = calculateTotal(newData);
        }
        
        setFormData(newData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const footer = (
        <>
            <button
                type="button"
                onClick={onClose}
                className="bg-white border border-slate-300 px-4 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
            >
                Cancelar
            </button>
            <button
                type="submit"
                form="lot-form"
                className="bg-indigo-600 px-4 py-2 rounded-lg text-white font-medium hover:bg-indigo-700"
            >
                {lot ? 'Atualizar Lote' : 'Adicionar Lote'}
            </button>
        </>
    );

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={lot ? 'Editar Lote' : 'Adicionar Novo Lote'} footer={footer} maxWidth="600px">
            <form id="lot-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pecuarista *</label>
                    <input
                        type="text"
                        name="producerName"
                        className="w-full p-2 border border-slate-300 rounded-lg"
                        value={formData.producerName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Município</label>
                    <input
                        type="text"
                        name="municipio"
                        className="w-full p-2 border border-slate-300 rounded-lg"
                        value={formData.municipio}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">UF</label>
                    <input
                        type="text"
                        name="uf"
                        className="w-full p-2 border border-slate-300 rounded-lg"
                        value={formData.uf}
                        onChange={handleChange}
                        maxLength={2}
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Corretor / Código</label>
                    <input
                        type="text"
                        name="brokerCode"
                        className="w-full p-2 border border-slate-300 rounded-lg"
                        value={formData.brokerCode}
                        onChange={handleChange}
                    />
                </div>
                
                <h3 className="col-span-2 font-bold text-slate-500 text-xs uppercase mt-2">Quantidade por Categoria</h3>
                
                <div className="grid grid-cols-5 col-span-2 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Boi</label>
                        <input
                            type="number"
                            name="boi"
                            className="w-full p-2 border border-slate-300 rounded-lg"
                            value={formData.boi}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Vaca</label>
                        <input
                            type="number"
                            name="vaca"
                            className="w-full p-2 border border-slate-300 rounded-lg"
                            value={formData.vaca}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Novilha</label>
                        <input
                            type="number"
                            name="novilha"
                            className="w-full p-2 border border-slate-300 rounded-lg"
                            value={formData.novilha}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Bubalino</label>
                        <input
                            type="number"
                            name="bubalino"
                            className="w-full p-2 border border-slate-300 rounded-lg"
                            value={formData.bubalino}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Touro</label>
                        <input
                            type="number"
                            name="touro"
                            className="w-full p-2 border border-slate-300 rounded-lg"
                            value={formData.touro}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="col-span-2 mt-4 bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                    <span className="font-bold text-slate-700">Total de Cabeças:</span>
                    <span className="text-2xl font-black text-indigo-600">{formData.total}</span>
                </div>
            </form>
        </BaseModal>
    );
};

export default SlaughterLotModal;
