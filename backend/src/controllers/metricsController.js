import ProjectTask from '../models/ProjectTask.js';
import Ticket from '../models/Ticket.js';
import ProjectColumn from '../models/ProjectColumn.js';

export const getBurnDown = async (req, res) => {
    try {
        const { projectId } = req.query;

        // Buscar tarefas do projeto
        const tasks = await ProjectTask.find({ project: projectId }).select('createdAt updatedAt status storyPoints');

        // Obter colunas para saber qual é a "Done"
        // Assumindo que a última coluna é a de conclusão
        const doneColumn = await ProjectColumn.findOne({ project: projectId }).sort('-order');
        const doneColumnId = doneColumn ? doneColumn._id.toString() : null;

        if (!doneColumnId) {
            return res.status(200).json({ success: true, data: [] });
        }

        // Agrupar por data
        // Simplificação: Burn-up chart (Tarefas concluídas acumuladas)
        // Para burn-down precisaria do escopo total inicial e subtrair. 
        // Vamos fazer um Burn-up de tarefas concluídas vs total.

        const tasksByDate = {};

        tasks.forEach(task => {
            if (task.status.toString() === doneColumnId && task.updatedAt) {
                const date = task.updatedAt.toISOString().split('T')[0];
                tasksByDate[date] = (tasksByDate[date] || 0) + 1;
            }
        });

        // Ordenar datas
        const sortedDates = Object.keys(tasksByDate).sort();

        let cumulative = 0;
        const data = sortedDates.map(date => {
            cumulative += tasksByDate[date];
            return {
                date,
                completed: cumulative
            };
        });

        res.status(200).json({
            success: true,
            data: {
                totalTasks: tasks.length,
                burnUp: data
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getLeadTime = async (req, res) => {
    try {
        const { projectId } = req.query;

        // Obter colunas para saber qual é a "Done"
        const doneColumn = await ProjectColumn.findOne({ project: projectId }).sort('-order');
        const doneColumnId = doneColumn ? doneColumn._id.toString() : null;

        if (!doneColumnId) {
            return res.status(200).json({ success: true, avgLeadTime: 0 });
        }

        const tasks = await ProjectTask.find({
            project: projectId,
            status: doneColumnId
        }).select('createdAt updatedAt');

        if (tasks.length === 0) {
            return res.status(200).json({ success: true, avgLeadTime: 0 });
        }

        let totalTime = 0;
        tasks.forEach(task => {
            const timeDiff = new Date(task.updatedAt) - new Date(task.createdAt);
            totalTime += timeDiff;
        });

        const avgLeadTimeMs = totalTime / tasks.length;
        const avgLeadTimeDays = Math.round(avgLeadTimeMs / (1000 * 60 * 60 * 24));

        res.status(200).json({
            success: true,
            avgLeadTimeDays,
            count: tasks.length
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getEffortDistribution = async (req, res) => {
    try {
        // Tickets de Suporte vs Projetos em paralelo
        const [totalTickets, totalTasks] = await Promise.all([
            Ticket.countDocuments(),
            ProjectTask.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            data: [
                { name: 'Suporte (Tickets)', value: totalTickets },
                { name: 'Projetos (Tasks)', value: totalTasks }
            ]
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
