import SlaughterSchedule from '../models/SlaughterSchedule.js';
import SlaughterLot from '../models/SlaughterLot.js';
import SlaughterVersion from '../models/SlaughterVersion.js';
import Manejo from '../models/Manejo.js';
import Fazenda from '../models/Fazenda.js';
import { calculateLotTiming } from '../utils/slaughterUtils.js';
import { syncClosureWithSchedule } from './slaughterClosureController.js';


/**
 * @desc    Recalcula todos os horários de uma escala
 */
async function recalculateAllLots(scheduleId, userId) {
    const schedule = await SlaughterSchedule.findById(scheduleId);
    if (!schedule) return;

    const lots = await SlaughterLot.find({ schedule: scheduleId }).sort({ order: 1 });
    
    let lastEndTime = schedule.startTime;
    const bulkOps = [];

    for (let i = 0; i < lots.length; i++) {
        const lot = lots[i];
        const timing = calculateLotTiming(lot.total, lastEndTime, schedule);

        bulkOps.push({
            updateOne: {
                filter: { _id: lot._id },
                update: {
                    $set: {
                        lotNumber: i + 1,
                        startTime: timing.startTime,
                        endTime: timing.endTime,
                        durationMinutes: timing.durationMinutes,
                        order: i + 1
                    }
                }
            }
        });

        lastEndTime = timing.endTime;
    }

    if (bulkOps.length > 0) {
        // Passo 1: Zerar números para evitar colisão de índice único durante o processo
        const tempOps = lots.map((l, idx) => ({
            updateOne: { filter: { _id: l._id }, update: { $set: { lotNumber: -(idx + 5000) } } }
        }));
        await SlaughterLot.bulkWrite(tempOps);

        // Passo 2: Aplicar números reais e horários
        await SlaughterLot.bulkWrite(bulkOps);
    }

    // Atualizar totais na escala
    const stats = await SlaughterLot.aggregate([
        { $match: { schedule: schedule._id, deletedAt: null } },
        { 
            $group: {
                _id: null,
                boi: { $sum: '$boi' },
                vaca: { $sum: '$vaca' },
                novilha: { $sum: '$novilha' },
                bubalino: { $sum: '$bubalino' },
                touro: { $sum: '$touro' },
                total: { $sum: '$total' }
            }
        }
    ]);

    const s = stats.length > 0 ? stats[0] : { boi: 0, vaca: 0, novilha: 0, bubalino: 0, touro: 0, total: 0 };
    
    await SlaughterSchedule.findByIdAndUpdate(scheduleId, {
        totalBoi: s.boi,
        totalVaca: s.vaca,
        totalNovilha: s.novilha,
        totalBubalino: s.bubalino,
        totalTouro: s.touro,
        totalCattle: s.total
    });

    // Snapshot para auditoria SIF
    const currentLots = await SlaughterLot.find({ schedule: scheduleId, deletedAt: null }).sort({ order: 1 });
    const versionCount = await SlaughterVersion.countDocuments({ resourceId: scheduleId });
    
    await SlaughterVersion.create({
        resourceId: scheduleId,
        resourceType: 'SlaughterSchedule',
        version: versionCount + 1,
        data: {
            ...schedule.toObject(),
            lots: currentLots
        },
        changedBy: userId,
        changeReason: 'Recálculo automático e sincronização de horários'
    });

    // Sincronizar com Fechamento SIF se existir
    await syncClosureWithSchedule(scheduleId);
}


/**
 * @desc    Busca escala por data
 * @route   GET /api/slaughter/schedules/:date
 */
export const getByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const targetDate = new Date(date + 'T00:00:00.000Z');

        const schedule = await SlaughterSchedule.findOne({ slaughterDate: targetDate }).populate('lots');

        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Escala não encontrada para esta data' });
        }

        res.json({ success: true, data: schedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Atualiza parâmetros da escala
 * @route   PUT /api/slaughter/schedules/:id
 */
export const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await SlaughterSchedule.findById(id);

        if (!schedule) return res.status(404).json({ success: false, message: 'Escala não encontrada' });
        if (schedule.status === 'CLOSED' && req.user.role !== 'admin') {
            return res.status(400).json({ success: false, message: 'Escala fechada só pode ser editada por admin' });
        }

        Object.assign(schedule, req.body);
        await schedule.save();

        await recalculateAllLots(id, req.user._id);

        res.json({ success: true, data: schedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Reabre escala (Admin)
 * @route   POST /api/slaughter/schedules/:id/reopen
 */
export const reopenSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await SlaughterSchedule.findById(id);

        if (!schedule) return res.status(404).json({ success: false, message: 'Escala não encontrada' });
        
        schedule.status = 'DRAFT';
        schedule.closedBy = null;
        schedule.closedAt = null;
        schedule.pdfUrl = null;
        
        await schedule.save();

        res.json({ success: true, message: 'Escala reaberta com sucesso' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Adiciona lote à escala
 * @route   POST /api/slaughter/schedules/:id/lots
 */
export const addLot = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await SlaughterSchedule.findById(id);

        if (!schedule) return res.status(404).json({ success: false, message: 'Escala não encontrada' });
        if (schedule.status === 'CLOSED') return res.status(400).json({ success: false, message: 'Escala já está fechada' });

        const lotCount = await SlaughterLot.countDocuments({ schedule: id });
        
        const total = (req.body.boi || 0) + (req.body.vaca || 0) + (req.body.novilha || 0) + (req.body.bubalino || 0) + (req.body.touro || 0);

        const newLot = await SlaughterLot.create({
            ...req.body,
            schedule: id,
            lotNumber: lotCount + 1,
            order: lotCount + 1,
            total
        });

        await recalculateAllLots(id, req.user._id);

        res.status(201).json({ success: true, data: newLot });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Reordena lotes
 * @route   POST /api/slaughter/schedules/:id/reorder
 */
export const reorderLots = async (req, res) => {
    try {
        const { id } = req.params;
        const { lotIds } = req.body; // Array de IDs na nova ordem

        for (let i = 0; i < lotIds.length; i++) {
            await SlaughterLot.findByIdAndUpdate(lotIds[i], { order: i + 1 });
        }

        await recalculateAllLots(id, req.user._id);

        res.json({ success: true, message: 'Lotes reordenados e horários recalculados' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Atualiza lote
 * @route   PUT /api/slaughter/lots/:id
 */
export const updateLot = async (req, res) => {
    try {
        const { id } = req.params;
        const lot = await SlaughterLot.findById(id);
        if (!lot) return res.status(404).json({ success: false, message: 'Lote não encontrado' });

        const schedule = await SlaughterSchedule.findById(lot.schedule);
        if (schedule.status === 'CLOSED' && req.user.role !== 'admin') {
            return res.status(400).json({ success: false, message: 'A escala está fechada' });
        }

        const total = (req.body.boi || 0) + (req.body.vaca || 0) + (req.body.novilha || 0) + (req.body.bubalino || 0) + (req.body.touro || 0);

        Object.assign(lot, { ...req.body, total });
        await lot.save();

        await recalculateAllLots(lot.schedule, req.user._id);

        res.json({ success: true, data: lot });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Remove lote
 * @route   DELETE /api/slaughter/lots/:id
 */
export const deleteLot = async (req, res) => {
    try {
        const { id } = req.params;
        const lot = await SlaughterLot.findById(id);
        if (!lot) return res.status(404).json({ success: false, message: 'Lote não encontrado' });

        const scheduleId = lot.schedule;
        const schedule = await SlaughterSchedule.findById(scheduleId);
        if (schedule.status === 'CLOSED' && req.user.role !== 'admin') {
            return res.status(400).json({ success: false, message: 'A escala está fechada' });
        }

        // Soft delete usando o campo deletedAt
        lot.deletedAt = new Date();
        await lot.save();

        await recalculateAllLots(scheduleId, req.user._id);

        res.json({ success: true, message: 'Lote removido com sucesso' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Força recálculo
 * @route   POST /api/slaughter/schedules/:id/recalculate
 */
export const recalculateLots = async (req, res) => {
    try {
        const { id } = req.params;
        await recalculateAllLots(id, req.user._id);
        res.json({ success: true, message: 'Horários recalculados com sucesso' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Fecha escala
 * @route   POST /api/slaughter/schedules/:id/close
 */
export const closeSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await SlaughterSchedule.findById(id);
        const lots = await SlaughterLot.find({ schedule: id });

        if (lots.length === 0) {
            return res.status(400).json({ success: false, message: 'Escala precisa de ao menos 1 lote para ser fechada' });
        }

        if (lots.some(l => l.total === 0)) {
            return res.status(400).json({ success: false, message: 'Existem lotes com total zero animais' });
        }

        schedule.status = 'CLOSED';
        schedule.closedBy = req.user._id;
        schedule.closedAt = new Date();
        // Aqui viria a lógica de gerar o PDF real
        schedule.pdfUrl = `/uploads/escalas/ESCALA_${id}.pdf`;
        
        await schedule.save();

        res.json({ success: true, message: 'Escala fechada com sucesso' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Calendário da Escala
 * @route   GET /api/slaughter/calendar
 */
export const getCalendar = async (req, res) => {
    try {
        const { month } = req.query;
        const start = new Date(month + '-01T00:00:00.000Z');
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);

        const schedules = await SlaughterSchedule.find({
            slaughterDate: { $gte: start, $lt: end }
        });

        // Sumário mensal (apenas de dias CLOSED)
        const closedSchedules = schedules.filter(s => s.status === 'CLOSED');
        const monthlySummary = {
            totalBoi: closedSchedules.reduce((acc, s) => acc + s.totalBoi, 0),
            totalVaca: closedSchedules.reduce((acc, s) => acc + s.totalVaca, 0),
            totalNovilha: closedSchedules.reduce((acc, s) => acc + s.totalNovilha, 0),
            totalBubalino: closedSchedules.reduce((acc, s) => acc + s.totalBubalino, 0),
            totalTouro: closedSchedules.reduce((acc, s) => acc + s.totalTouro, 0),
            totalCattle: closedSchedules.reduce((acc, s) => acc + s.totalCattle, 0),
            closedDays: closedSchedules.length
        };

        res.json({ success: true, data: schedules, monthlySummary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Obtém rastreabilidade completa de um lote
 * @route   GET /api/slaughter/lots/:id/traceability
 */
export const getSlaughterTraceability = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Buscar Lote e Escala (para saber a data do abate)
        const lot = await SlaughterLot.findById(id)
            .populate('schedule', 'slaughterDate status')
            .populate('fazenda');

        if (!lot) {
            return res.status(404).json({ success: false, message: 'Lote de abate não encontrado' });
        }

        // 2. Buscar histórico de Manejos da Fazenda de origem
        // Filtramos manejos ocorridos até a data do abate
        const slaughterDate = lot.schedule?.slaughterDate || new Date();
        
        const manejos = await Manejo.find({
            fazenda_id: lot.fazenda?._id,
            data_execucao: { $lte: slaughterDate }
        })
        .sort({ data_execucao: -1 })
        .populate('responsavel_id', 'name email');

        // 3. Consolidar Insumos e Aplicações
        const traceReport = {
            lotInfo: {
                number: lot.lotNumber,
                rancher: lot.rancherName,
                totalAnimals: lot.total,
                slaughterDate: lot.schedule?.slaughterDate
            },
            origin: lot.fazenda ? {
                nome: lot.fazenda.nome,
                municipio: lot.fazenda.municipio,
                estado: lot.fazenda.estado,
                car: lot.fazenda.car
            } : 'Dados da fazenda não disponíveis',
            traceability: manejos.map(m => ({
                id: m._id,
                data: m.data_execucao,
                tipo: m.tipo,
                descricao: m.descricao,
                produto: m.aplicacao?.produto || m.adubacao?.produto || 'N/A',
                dose: m.aplicacao?.dose_ha || m.adubacao?.dose_ha || 0,
                responsavel: m.responsavel_id?.name || 'Não informado'
            }))
        };

        res.json({
            success: true,
            data: traceReport
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
