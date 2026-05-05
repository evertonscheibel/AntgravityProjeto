import Asset from '../models/Asset.js';
import AssetTimeline from '../models/AssetTimeline.js';
import * as XLSX from 'xlsx';
import fs from 'fs';

// ... existing imports and functions ...

export const getAssets = async (req, res, next) => {
    try {
        const { category, isActive, deviceType, search } = req.query;
        let query = {};

        if (category) query.category = category;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (deviceType) query['network.deviceType'] = deviceType;

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { assetId: searchRegex },
                { description: searchRegex },
                { 'network.hostname': searchRegex },
                { 'network.mgmtIp': searchRegex },
                { brand: searchRegex },
                { model: searchRegex },
                { serialNumber: searchRegex }
            ];
        }

        const assets = await Asset.find(query)
            .populate('assignedTo', 'name email')
            .populate('responsible', 'name email')
            .populate('network.uplinkDeviceAssetId', 'assetId description network.mgmtIp')
            .sort({ createdAt: -1 });

        res.status(200).json(assets);
    } catch (error) {
        next(error);
    }
};

export const getAsset = async (req, res, next) => {
    try {
        const asset = await Asset.findById(req.params.id)
            .populate('assignedTo', 'name email')
            .populate('responsible', 'name email');
        if (!asset) {
            return res.status(404).json({ message: 'Ativo não encontrado' });
        }
        res.status(200).json(asset);
    } catch (error) {
        next(error);
    }
};

export const createAsset = async (req, res, next) => {
    try {
        // Validações específicas para Ativos de Rede
        if (req.body.category === 'network') {
            const network = req.body.network || {};
            if (!network.deviceType) {
                return res.status(400).json({ message: 'Tipo de dispositivo é obrigatório para ativos de rede' });
            }
            if (network.snmpEnabled && !network.snmpVersion) {
                return res.status(400).json({ message: 'Versão SNMP é obrigatória quando SNMP está habilitado' });
            }
        }

        const asset = await Asset.create(req.body);

        // Criar evento inicial na timeline
        await AssetTimeline.create({
            asset: asset._id,
            eventType: 'aquisicao',
            itilCategory: 'asset_management',
            cobitProcess: 'BAI09',
            eventDate: asset.acquisitionDate || asset.purchaseDate || new Date(),
            user: req.user._id,
            title: 'Ativo adquirido',
            description: `Ativo ${asset.assetId} - ${asset.description} foi registrado no sistema`,
            newData: {
                status: asset.status,
                location: asset.location,
                responsible: asset.responsible,
                value: asset.purchaseValue
            },
            cost: asset.purchaseValue || 0
        });

        const populatedAsset = await Asset.findById(asset._id)
            .populate('assignedTo', 'name email')
            .populate('responsible', 'name email')
            .populate('network.uplinkDeviceAssetId', 'assetId description network.mgmtIp'); // Populate uplink info

        res.status(201).json(populatedAsset);
    } catch (error) {
        // Tratamento de erro de chave duplicada (IP de Gerência)
        if (error.code === 11000 && error.keyPattern && error.keyPattern['network.mgmtIp']) {
            return res.status(400).json({ message: 'Já existe um ativo de rede com este IP de gerência.' });
        }
        next(error);
    }
};

export const updateAsset = async (req, res, next) => {
    try {
        const oldAsset = await Asset.findById(req.params.id);
        if (!oldAsset) {
            return res.status(404).json({ message: 'Ativo não encontrado' });
        }

        const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('assignedTo', 'name email')
            .populate('responsible', 'name email');

        // Detectar mudanças importantes para timeline
        const changes = [];
        if (oldAsset.status !== asset.status) changes.push(`Status alterado de ${oldAsset.status} para ${asset.status}`);
        if (oldAsset.location !== asset.location) changes.push(`Localização alterada de ${oldAsset.location} para ${asset.location}`);
        if (oldAsset.assignedTo?.toString() !== asset.assignedTo?._id.toString()) changes.push('Usuário atribuído alterado');

        if (changes.length > 0) {
            await AssetTimeline.create({
                asset: asset._id,
                eventType: 'atualizacao',
                itilCategory: 'asset_management',
                cobitProcess: 'BAI09',
                user: req.user._id,
                title: 'Ativo atualizado',
                description: changes.join(', '),
                previousData: {
                    status: oldAsset.status,
                    location: oldAsset.location,
                    assignedTo: oldAsset.assignedTo
                },
                newData: {
                    status: asset.status,
                    location: asset.location,
                    assignedTo: asset.assignedTo
                }
            });
        }

        res.status(200).json(asset);
    } catch (error) {
        // Tratamento de erro de chave duplicada (IP de Gerência)
        if (error.code === 11000 && error.keyPattern && error.keyPattern['network.mgmtIp']) {
            return res.status(400).json({ message: 'Já existe um ativo de rede com este IP de gerência.' });
        }
        next(error);
    }
};

export const deleteAsset = async (req, res, next) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) {
            return res.status(404).json({ message: 'Ativo não encontrado' });
        }

        // Em vez de deletar fisicamente, podemos marcar como descartado ou apenas registrar na timeline antes de deletar
        // Se for deletar fisicamente:
        await AssetTimeline.create({
            asset: asset._id,
            eventType: 'baixa',
            itilCategory: 'asset_management',
            cobitProcess: 'BAI09',
            user: req.user._id,
            title: 'Ativo removido',
            description: `Ativo ${asset.assetId} foi removido do sistema`,
            previousData: asset.toObject()
        });

        await asset.deleteOne();
        res.status(200).json({ message: 'Ativo excluído com sucesso' });
    } catch (error) {
        next(error);
    }
};

export const toggleActiveStatus = async (req, res, next) => {
    try {
        const { isActive } = req.body;
        const asset = await Asset.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        );

        if (!asset) {
            return res.status(404).json({ message: 'Ativo não encontrado' });
        }

        await AssetTimeline.create({
            asset: asset._id,
            eventType: isActive ? 'ativacao' : 'inativacao',
            itilCategory: 'asset_management',
            cobitProcess: 'BAI09',
            user: req.user._id,
            title: isActive ? 'Ativo reativado' : 'Ativo inativado',
            description: `O ativo foi ${isActive ? 'ativado' : 'inativado'} manualmente.`,
            newData: { isActive }
        });

        res.status(200).json(asset);
    } catch (error) {
        next(error);
    }
};

export const getAssetWithDetails = async (req, res, next) => {
    try {
        const asset = await Asset.findById(req.params.id)
            .populate('assignedTo', 'name email')
            .populate('responsible', 'name email')
            .populate('network.uplinkDeviceAssetId', 'assetId description network.mgmtIp');

        if (!asset) {
            return res.status(404).json({ message: 'Ativo não encontrado' });
        }

        // Buscar manutenções e timeline (poderia ser via virtuals populate também)
        // Mas como são models separados e queremos controle, faremos buscas paralelas ou usaremos os virtuals se configurados
        // Vamos usar os virtuals configurados no model Asset
        await asset.populate('maintenances');
        await asset.populate('timeline');

        res.status(200).json(asset);
    } catch (error) {
        next(error);
    }
};

export const getAssetReport = async (req, res, next) => {
    try {
        const totalValue = await Asset.aggregate([
            { $group: { _id: null, total: { $sum: "$purchaseValue" } } }
        ]);

        const byStatus = await Asset.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const byLocation = await Asset.aggregate([
            { $group: { _id: "$location", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const warrantyExpiring = await Asset.find({
            warrantyExpiration: {
                $gte: new Date(),
                $lte: new Date(new Date().setDate(new Date().getDate() + 90))
            }
        }).select('assetId description warrantyExpiration location');

        res.status(200).json({
            totalValue,
            byStatus,
            byLocation,
            warrantyExpiring
        });
    } catch (error) {
        next(error);
    }
};

export const importAssets = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }

        console.log('Arquivo recebido:', req.file.path);

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        console.log('Total de linhas:', data.length);
        console.log('Primeira linha:', data[0]);

        const results = {
            success: 0,
            errors: 0,
            details: []
        };

        for (const row of data) {
            try {
                // Mapeamento flexível - suporta vários formatos de coluna
                const assetData = {
                    assetId: row['ID'] || row['Patrimonio'] || row['id'] || `AUTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    description: row['Descricao'] || row['Nome'] || row['description'] || row['Descrição'],
                    type: (row['Tipo'] || row['type'] || 'outro').toLowerCase(),
                    brand: row['Marca'] || row['brand'] || '',
                    model: row['Modelo'] || row['model'] || '',
                    serialNumber: row['NumeroSerie'] || row['Numero'] || row['Serial'] || row['serialNumber'] || '',
                    location: row['Localizacao'] || row['Localização'] || row['Setor'] || row['location'] || '',
                    status: (row['Status'] || row['status'] || 'ativo').toLowerCase(),
                    purchaseDate: row['DataCompra'] || row['DataCor'] || row['Data'] ? new Date(row['DataCompra'] || row['DataCor'] || row['Data']) : undefined,
                    purchaseValue: Number(row['Valor'] || row['value'] || 0),
                    warrantyExpiration: row['Garantia'] ? new Date(row['Garantia']) : undefined
                };

                // Validar tipo
                const validTypes = ['notebook', 'desktop', 'monitor', 'impressora', 'servidor', 'rede', 'periferico', 'software', 'outro'];
                if (!validTypes.includes(assetData.type)) {
                    assetData.type = 'outro';
                }

                // Validar status
                const validStatuses = ['ativo', 'em_manutencao', 'disponivel', 'descartado', 'perdido'];
                if (!validStatuses.includes(assetData.status)) {
                    assetData.status = 'ativo';
                }

                // Validar campos obrigatórios mínimos
                if (!assetData.description) {
                    throw new Error('Descrição é obrigatória');
                }

                // Verificar duplicidade de ID
                const existing = await Asset.findOne({ assetId: assetData.assetId });
                if (existing) {
                    throw new Error(`Ativo com ID ${assetData.assetId} já existe`);
                }

                const asset = await Asset.create(assetData);

                // Criar evento na timeline
                await AssetTimeline.create({
                    asset: asset._id,
                    eventType: 'aquisicao',
                    itilCategory: 'asset_management',
                    cobitProcess: 'BAI09',
                    eventDate: new Date(),
                    user: req.user._id,
                    title: 'Importação em massa',
                    description: 'Ativo importado via planilha Excel',
                    cost: asset.purchaseValue || 0
                });

                results.success++;
            } catch (error) {
                console.error('Erro ao processar linha:', row, error.message);
                results.errors++;
                results.details.push({
                    assetId: row['ID'] || row['Patrimonio'] || 'N/A',
                    description: row['Descricao'] || row['Nome'] || 'N/A',
                    error: error.message
                });
            }
        }

        // Remover arquivo temporário
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            message: 'Processamento concluído',
            results
        });

    } catch (error) {
        console.error('Erro geral na importação:', error);
        // Tentar remover arquivo mesmo em caso de erro
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {
                console.error('Erro ao remover arquivo:', e);
            }
        }
        next(error);
    }
};

export const exportAssets = async (req, res, next) => {
    try {
        const assets = await Asset.find().lean();

        const data = assets.map(asset => ({
            'ID': asset.assetId,
            'Descricao': asset.description,
            'Tipo': asset.type,
            'Marca': asset.brand,
            'Modelo': asset.model,
            'NumeroSerie': asset.serialNumber,
            'Localizacao': asset.location,
            'Status': asset.status,
            'DataCompra': asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
            'Valor': asset.purchaseValue,
            'Garantia': asset.warrantyExpiration ? new Date(asset.warrantyExpiration).toISOString().split('T')[0] : ''
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Ativos');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="ativos.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        next(error);
    }
};
