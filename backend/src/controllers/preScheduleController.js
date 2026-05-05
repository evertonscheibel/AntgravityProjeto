import SlaughterPreSchedule from '../models/SlaughterPreSchedule.js';
import SlaughterSchedule from '../models/SlaughterSchedule.js';
import SlaughterLot from '../models/SlaughterLot.js';
import { calculateLotTiming } from '../utils/slaughterUtils.js';

/**
 * @desc    Busca pré-escala por data (cria DRAFT se não existir)
 * @route   GET /api/slaughter/pre-schedule/:date
 */
export const getByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const targetDate = new Date(date + 'T00:00:00.000Z');

        let preSchedule = await SlaughterPreSchedule.findOne({ date: targetDate });

        if (!preSchedule) {
            preSchedule = await SlaughterPreSchedule.create({
                date: targetDate,
                createdBy: req.user._id,
                status: 'DRAFT'
            });
        }

        res.json({ success: true, data: preSchedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Atualiza pré-escala
 * @route   PUT /api/slaughter/pre-schedule/:id
 */
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const preSchedule = await SlaughterPreSchedule.findById(id);

        if (!preSchedule) {
            return res.status(404).json({ success: false, message: 'Pré-escala não encontrada' });
        }

        if (preSchedule.status === 'PUBLISHED' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Apenas admin pode editar pré-escala publicada' });
        }

        // Idempotência
        if (req.body.lastRequestId && preSchedule.lastRequestId === req.body.lastRequestId) {
            return res.json({ success: true, data: preSchedule });
        }

        Object.assign(preSchedule, req.body);
        preSchedule.updatedBy = req.user._id;
        await preSchedule.save();

        res.json({ success: true, data: preSchedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Publica pré-escala (Sincroniza com Escala Oficial)
 * @route   POST /api/slaughter/pre-schedule/:id/publish
 */
export const publish = async (req, res) => {
    try {
        const { id } = req.params;
        const preSchedule = await SlaughterPreSchedule.findById(id);

        if (!preSchedule) {
            return res.status(404).json({ success: false, message: 'Pré-escala não encontrada' });
        }

        // 1. Criar ou atualizar SlaughterSchedule
        let schedule = await SlaughterSchedule.findOne({ slaughterDate: preSchedule.date });

        if (!schedule) {
            schedule = new SlaughterSchedule({
                slaughterDate: preSchedule.date,
                createdBy: req.user._id
            });
        }

        // Sincronizar parâmetros de tempo
        schedule.startTime = preSchedule.startTime;
        schedule.rateHeadsPerHour = preSchedule.rateHeadsPerHour;
        schedule.breakfastTime = preSchedule.breakfastTime;
        schedule.breakfastDuration = preSchedule.breakfastDuration;
        schedule.lunchTime = preSchedule.lunchTime;
        schedule.lunchDuration = preSchedule.lunchDuration;
        
        await schedule.save();

        // 2. Limpar lotes existentes para recriação (ou atualizar)
        await SlaughterLot.deleteMany({ schedule: schedule._id });

        // 3. Gerar novos lotes com cálculo de horários
        let lastEndTime = schedule.startTime;
        const newLots = [];

        for (let i = 0; i < preSchedule.lots.length; i++) {
            const preLot = preSchedule.lots[i];
            const timing = calculateLotTiming(preLot.total, lastEndTime, schedule);

            newLots.push({
                schedule: schedule._id,
                lotNumber: i + 1,
                rancherName: preLot.producerName,
                brokerNumber: preLot.brokerCode || '0',
                boi: preLot.boi || 0,
                vaca: preLot.vaca || 0,
                novilha: preLot.novilha || 0,
                bubalino: preLot.bubalino || 0,
                touro: preLot.touro || 0,
                total: preLot.total,
                startTime: timing.startTime,
                durationMinutes: timing.durationMinutes,
                endTime: timing.endTime,
                order: i + 1
            });

            lastEndTime = timing.endTime;
        }

        if (newLots.length > 0) {
            await SlaughterLot.insertMany(newLots);
        }

        // 4. Atualizar status da pré-escala
        preSchedule.status = 'PUBLISHED';
        preSchedule.publishedBy = req.user._id;
        preSchedule.publishedAt = new Date();
        await preSchedule.save();

        res.json({ success: true, message: 'Pré-escala publicada e escala sincronizada' });
    } catch (error) {
        console.error('Erro ao publicar pré-escala:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Calendário mensal da pré-escala
 * @route   GET /api/slaughter/pre-schedule/calendar
 */
export const getCalendar = async (req, res) => {
    try {
        const { month } = req.query; // YYYY-MM
        const start = new Date(month + '-01T00:00:00.000Z');
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);

        const schedules = await SlaughterPreSchedule.find({
            date: { $gte: start, $lt: end }
        }).select('date status totalCattle');

        res.json({ success: true, data: schedules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
