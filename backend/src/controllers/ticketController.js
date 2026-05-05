import Ticket from '../models/Ticket.js';

// @desc    Listar todos os tickets
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res, next) => {
    try {
        const { status, priority, category, assignedTo } = req.query;

        let query = {};

        // Filtros
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (category) query.category = category;
        if (assignedTo) query.assignedTo = assignedTo;

        // Se for cliente, mostrar apenas seus tickets
        if (req.user.role === 'cliente') {
            query.requester = req.user.id;
        }

        const tickets = await Ticket.find(query)
            .populate('requester', 'name email')
            .populate('assignedTo', 'name email')
            .populate('asset', 'assetId description')
            .populate('comments.user', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obter ticket por ID
// @route   GET /api/tickets/:id
// @access  Private
export const getTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('requester', 'name email')
            .populate('assignedTo', 'name email')
            .populate('asset', 'assetId description location')
            .populate('comments.user', 'name email');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket não encontrado'
            });
        }

        // Verificar permissão
        if (req.user.role === 'cliente' && ticket.requester._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado'
            });
        }

        res.json({
            success: true,
            data: ticket
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Criar novo ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req, res, next) => {
    try {
        const ticketData = {
            ...req.body,
            requester: req.user.id
        };

        // Remove assignedTo se estiver vazio ou não for um ObjectId válido
        if (!ticketData.assignedTo || typeof ticketData.assignedTo !== 'string' || ticketData.assignedTo.length !== 24) {
            delete ticketData.assignedTo;
        }

        const ticket = await Ticket.create(ticketData);

        const populatedTicket = await Ticket.findById(ticket._id)
            .populate('requester', 'name email')
            .populate('assignedTo', 'name email');

        res.status(201).json({
            success: true,
            data: populatedTicket
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Atualizar ticket
// @route   PUT /api/tickets/:id
// @access  Private (Admin/Tecnico)
export const updateTicket = async (req, res, next) => {
    try {
        let ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket não encontrado'
            });
        }

        // Se status mudou para resolvido, adicionar data
        if (req.body.status === 'resolvido' && ticket.status !== 'resolvido') {
            req.body.resolvedAt = new Date();
        }

        ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('requester', 'name email')
            .populate('assignedTo', 'name email')
            .populate('asset', 'assetId description');

        res.json({
            success: true,
            data: ticket
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Deletar ticket
// @route   DELETE /api/tickets/:id
// @access  Private (Admin)
export const deleteTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket não encontrado'
            });
        }

        await ticket.deleteOne();

        res.json({
            success: true,
            message: 'Ticket deletado com sucesso'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Adicionar comentário ao ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket não encontrado'
            });
        }

        ticket.comments.push({
            user: req.user.id,
            comment: req.body.comment
        });

        await ticket.save();

        const updatedTicket = await Ticket.findById(ticket._id)
            .populate('comments.user', 'name email');

        res.status(201).json({
            success: true,
            data: updatedTicket
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Estatísticas de tickets
// @route   GET /api/tickets/stats/summary
// @access  Private (Admin/Tecnico)
export const getTicketStats = async (req, res, next) => {
    try {
        const stats = await Ticket.aggregate([
            {
                $facet: {
                    byStatus: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    byPriority: [
                        { $group: { _id: '$priority', count: { $sum: 1 } } }
                    ],
                    byCategory: [
                        { $group: { _id: '$category', count: { $sum: 1 } } }
                    ],
                    avgResolutionTime: [
                        {
                            $match: { resolvedAt: { $exists: true } }
                        },
                        {
                            $project: {
                                resolutionTime: {
                                    $subtract: ['$resolvedAt', '$createdAt']
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                avgTime: { $avg: '$resolutionTime' }
                            }
                        }
                    ]
                }
            }
        ]);

        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Criar ticket público (sem autenticação)
// @route   POST /api/tickets/public
// @access  Public
export const createPublicTicket = async (req, res, next) => {
    try {
        const { contactName, contactEmail, contactPhone, title, description, category } = req.body;

        // Validar campos obrigatórios
        if (!contactName || !contactEmail || !title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Nome, email, assunto e descrição são obrigatórios'
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }

        const ticketData = {
            title,
            description,
            category: category || 'suporte',
            contactName,
            contactEmail,
            contactPhone,
            isPublic: true,
            status: 'aberto',
            priority: 'media'
        };

        const ticket = await Ticket.create(ticketData);

        res.status(201).json({
            success: true,
            message: 'Chamado registrado com sucesso! Entraremos em contato em breve.',
            data: {
                ticketNumber: ticket.ticketNumber,
                title: ticket.title,
                status: ticket.status
            }
        });
    } catch (error) {
        next(error);
    }
};

