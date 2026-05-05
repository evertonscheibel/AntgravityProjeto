
import ProjectTask from '../models/ProjectTask.js';
import Project from '../models/Project.js';
import ProjectColumn from '../models/ProjectColumn.js';
import Ticket from '../models/Ticket.js';

// @desc    Criar nova tarefa
// @route   POST /api/projects/:projectId/tasks
// @access  Private
export const createTask = async (req, res) => {
    try {
        const { title, description, priority, assignedTo, dueDate, status, storyPoints } = req.body;
        const projectId = req.params.projectId;

        let columnId = status;
        if (!columnId) {
            const firstColumn = await ProjectColumn.findOne({ project: projectId }).sort({ order: 1 });
            if (!firstColumn) {
                return res.status(400).json({ success: false, message: 'Projeto sem colunas definidas' });
            }
            columnId = firstColumn._id;
        }

        const task = await ProjectTask.create({
            project: projectId,
            title,
            description,
            priority,
            assignedTo,
            dueDate,
            storyPoints,
            status: columnId
        });

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Atualizar tarefa
// @route   PUT /api/projects/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
    try {
        const task = await ProjectTask.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('assignedTo', 'name email avatar')
            .populate('linkedTicket', 'title status');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
        }

        res.json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Mover tarefa
// @route   PUT /api/projects/tasks/:id/move
// @access  Private
export const moveTask = async (req, res) => {
    try {
        const { columnId } = req.body;

        const task = await ProjectTask.findByIdAndUpdate(
            req.params.id,
            { status: columnId },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
        }

        res.json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Deletar tarefa
// @route   DELETE /api/projects/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
    try {
        const task = await ProjectTask.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
        }

        await task.deleteOne();
        res.json({ success: true, message: 'Tarefa removida' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Converter Ticket em Tarefa
// @route   POST /api/projects/tasks/from-ticket
// @access  Private
export const convertTicketToTask = async (req, res) => {
    try {
        const { ticketId, projectId } = req.body;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket não encontrado' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
        }

        const firstColumn = await ProjectColumn.findOne({ project: projectId }).sort({ order: 1 });
        if (!firstColumn) {
            return res.status(400).json({ success: false, message: 'Projeto sem colunas' });
        }
        const targetColumnId = firstColumn._id;

        const task = await ProjectTask.create({
            project: projectId,
            title: `[Ticket #${ticketId.slice(-4)}] ${ticket.title}`,
            description: ticket.description + `\n\nOriginal Ticket: ${ticket._id}`,
            priority: ticket.priority === 'critica' ? 'critical' : ticket.priority === 'alta' ? 'high' : 'medium',
            assignedTo: ticket.assignedTo,
            status: targetColumnId,
            linkedTicket: ticket._id
        });

        ticket.relatedTaskId = task._id;
        await ticket.save();

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
