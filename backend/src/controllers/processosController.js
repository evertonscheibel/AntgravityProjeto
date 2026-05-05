import Cycle from '../models/Cycle.js';
import Process from '../models/Process.js';
import User from '../models/User.js';

export const getCycles = async (req, res) => {
    try {
        const cycles = await Cycle.find({ company: req.user.company || 'default' }).sort({ createdAt: -1 });
        res.json({ success: true, data: cycles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getActiveCycle = async (req, res) => {
    try {
        const cycle = await Cycle.findOne({
            company: req.user.company || 'default',
            status: 'OPEN'
        });
        res.json({ success: true, data: cycle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createCycle = async (req, res) => {
    try {
        const { name, startDate } = req.body;

        // Verificar se já existe um ciclo aberto
        const activeCycle = await Cycle.findOne({
            company: req.user.company || 'default',
            status: 'OPEN'
        });

        if (activeCycle) {
            return res.status(400).json({
                success: false,
                message: 'Já existe um ciclo aberto. Feche-o antes de abrir um novo.'
            });
        }

        const cycle = await Cycle.create({
            name,
            startDate,
            status: 'OPEN',
            createdBy: req.user._id,
            company: req.user.company || 'default'
        });

        res.status(201).json({ success: true, data: cycle });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const closeCycle = async (req, res) => {
    try {
        const cycle = await Cycle.findById(req.params.id);
        if (!cycle) {
            return res.status(404).json({ success: false, message: 'Ciclo não encontrado' });
        }

        cycle.status = 'CLOSED';
        cycle.endDate = new Date();
        await cycle.save();

        res.json({ success: true, data: cycle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProcesses = async (req, res) => {
    try {
        const { cycleId, sector, category } = req.query;
        const query = { company: req.user.company || 'default' };
        if (cycleId) query.cycle = cycleId;
        if (sector) query.sector = sector;
        if (category) query.category = category;

        const processes = await Process.find(query)
            .populate('responsible', 'name')
            .sort({ deadline: 1 });

        res.json({ success: true, data: processes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createProcess = async (req, res) => {
    try {
        const { title, description, sector, category, responsible, cycleId, deadline, priority } = req.body;

        const process = await Process.create({
            title,
            description,
            sector,
            category,
            responsible,
            cycle: cycleId,
            deadline,
            priority,
            company: req.user.company || 'default'
        });

        res.status(201).json({ success: true, data: process });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deliverProcess = async (req, res) => {
    try {
        const { score, feedback } = req.body;
        const process = await Process.findById(req.params.id);

        if (!process) {
            return res.status(404).json({ success: false, message: 'Processo não encontrado' });
        }

        process.status = 'COMPLETED';
        process.completedAt = new Date();
        process.score = score;
        process.feedback = feedback;
        await process.save();

        res.json({ success: true, data: process });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteProcess = async (req, res) => {
    try {
        const process = await Process.findByIdAndDelete(req.params.id);
        if (!process) {
            return res.status(404).json({ success: false, message: 'Processo não encontrado' });
        }
        res.json({ success: true, message: 'Processo removido com sucesso' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getReports = async (req, res) => {
    try {
        const company = req.user.company || 'default';
        const { cycleId, sector, category } = req.query;

        const query = { company };
        if (cycleId) query.cycle = cycleId;
        if (sector) query.sector = sector;
        if (category) query.category = category;

        const processes = await Process.find(query);

        const total = processes.length;
        const completed = processes.filter(p => p.status === 'COMPLETED').length;
        const overdue = processes.filter(p => p.status === 'PENDING' && new Date(p.deadline) < new Date()).length;

        const avgScore = completed > 0
            ? processes.reduce((acc, p) => acc + (p.score || 0), 0) / completed
            : 0;

        const onTime = completed > 0
            ? (processes.filter(p => p.status === 'COMPLETED' && p.completedAt <= p.deadline).length / completed) * 100
            : 0;

        // Group by status
        const statusDistribution = [
            { name: 'Concluídos', value: completed },
            { name: 'Pendentes', value: total - completed - overdue },
            { name: 'Atrasados', value: overdue }
        ];

        // Group by sector (avg score)
        const sectors = [...new Set(processes.map(p => p.sector))];
        const avgScoreBySector = sectors.map(sector => {
            const sectorProcesses = processes.filter(p => p.sector === sector && p.status === 'COMPLETED');
            const score = sectorProcesses.length > 0
                ? sectorProcesses.reduce((acc, p) => acc + (p.score || 0), 0) / sectorProcesses.length
                : 0;
            return { name: sector, score: parseFloat(score.toFixed(1)) };
        });

        res.json({
            success: true,
            data: {
                kpis: { avgScore: parseFloat(avgScore.toFixed(1)), onTime: Math.round(onTime), overdue, completed, total },
                statusDistribution,
                avgScoreBySector
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
