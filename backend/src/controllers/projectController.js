
import Project from '../models/Project.js';
import ProjectColumn from '../models/ProjectColumn.js';
import ProjectTask from '../models/ProjectTask.js';

// @desc    Criar novo projeto
// @route   POST /api/projects
// @access  Private (Admin/Manager)
export const createProject = async (req, res) => {
    try {
        const { name, description, methodology, endDate, status } = req.body;

        const project = await Project.create({
            name,
            description,
            manager: req.user._id,
            members: [req.user._id],
            methodology,
            endDate,
            status: status || 'PLANNING'
        });

        // Criar colunas padrão
        const isKanban = methodology === 'KANBAN';
        const columns = [
            { name: 'Backlog', order: 0 },
            { name: 'A Fazer', order: 1 },
            { name: 'Em Progresso', order: 2 },
            { name: 'Revisão', order: 3 },
            { name: 'Concluído', order: 4 }
        ];

        await ProjectColumn.insertMany(
            columns.map(col => ({
                project: project._id,
                name: col.name,
                order: col.order
            }))
        );

        res.status(201).json({ success: true, data: project });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Listar todos os projetos
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({}).populate('manager', 'name email');
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Obter detalhes do projeto (Board)
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('manager', 'name email')
            .populate('members', 'name email role');

        if (!project) {
            return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
        }

        const columns = await ProjectColumn.find({ project: project._id }).sort({ order: 1 });
        const tasks = await ProjectTask.find({ project: project._id })
            .populate('assignedTo', 'name')
            .populate('linkedTicket', 'title status');

        res.json({
            success: true,
            data: {
                project,
                columns,
                tasks
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Atualizar projeto
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
        }

        res.json({ success: true, data: project });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Deletar projeto
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
        }

        await project.deleteOne();
        await ProjectColumn.deleteMany({ project: project._id });
        await ProjectTask.deleteMany({ project: project._id });

        res.json({ success: true, message: 'Projeto removido' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Estatísticas do projeto
// @route   GET /api/projects/:id/stats
// @access  Private
export const getProjectStats = async (req, res) => {
    try {
        const projectId = req.params.id;
        const total = await ProjectTask.countDocuments({ project: projectId });

        // Simplificação: apenas contar tarefas na última coluna como completas
        // Na prática precisaria saber qual é a coluna "Done"
        // Vamos assumir que as colunas com ordem >= 4 são "Done" ou buscar pelo nome
        const doneColumns = await ProjectColumn.find({ project: projectId, name: 'Concluído' });
        const doneColumnIds = doneColumns.map(c => c._id);

        const completed = await ProjectTask.countDocuments({
            project: projectId,
            status: { $in: doneColumnIds }
        });

        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        res.json({ success: true, data: { total, completed, percentage } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
