import ProjectTask from '../models/ProjectTask.js';
import ProjectColumn from '../models/ProjectColumn.js';
import Ticket from '../models/Ticket.js';

export const createTask = async (req, res) => {
    try {
        const { projectId, title, description, priority, assignedTo, storyPoints, tags, statusId } = req.body;

        // Se statusId não for enviado, pega a primeira coluna (Backlog)
        let columnId = statusId;
        if (!columnId) {
            const firstColumn = await ProjectColumn.findOne({ project: projectId }).sort('order');
            if (!firstColumn) {
                return res.status(400).json({ success: false, message: 'Projeto não possui colunas configuradas' });
            }
            columnId = firstColumn._id;
        }

        const task = await ProjectTask.create({
            project: projectId,
            title,
            description,
            status: columnId,
            priority,
            assignedTo,
            storyPoints,
            tags
        });

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const moveTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { columnId } = req.body;

        const task = await ProjectTask.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
        }

        task.status = columnId;
        await task.save();

        // Verificar se foi movida para coluna DONE e se tem ticket vinculado para notificar/atualizar
        // (Será refinado posteriormente com automação mais complexa)

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const linkTicket = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { ticketId } = req.body;

        const task = await ProjectTask.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
        }

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket não encontrado' });
        }

        // Link bidirecional
        task.linkedTicket = ticket._id;
        ticket.relatedTaskId = task._id; // Campo virtual/ref adicionado ao Ticket

        await task.save();
        await ticket.save();

        res.status(200).json({
            success: true,
            data: { task, ticket }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Criar tarefa diretamente de um ticket
export const createFromTicket = async (req, res) => {
    try {
        const { projectId, ticketId } = req.body;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket não encontrado' });
        }

        // Pega coluna padrão
        const firstColumn = await ProjectColumn.findOne({ project: projectId }).sort('order');
        if (!firstColumn) {
            return res.status(400).json({ success: false, message: 'Projeto sem colunas' });
        }

        const task = await ProjectTask.create({
            project: projectId,
            title: `[Ticket #${ticketId.substr(-6)}] ${ticket.title}`,
            description: ticket.description,
            status: firstColumn._id,
            priority: ticket.priority === 'critica' || ticket.priority === 'alta' ? 'high' : 'medium',
            linkedTicket: ticket._id
        });

        // Atualiza ticket
        ticket.relatedTaskId = task._id;
        ticket.status = 'em_andamento'; // Opcional: já muda status do ticket
        await ticket.save();

        res.status(201).json({
            success: true,
            data: task
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}
