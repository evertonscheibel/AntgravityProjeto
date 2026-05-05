import User from '../models/User.js';

// @desc    Listar todos os usuários
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obter usuário por ID
// @route   GET /api/users/:id
// @access  Private (Admin)
export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Criar novo usuário
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Verificar se usuário já existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Email já cadastrado'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'cliente'
        });

        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                active: user.active
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Atualizar usuário
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res, next) => {
    try {
        const { name, email, password, role, active } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Atualizar campos
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password; // Será hasheado pelo pre-save hook
        if (role) user.role = role;
        if (active !== undefined) user.active = active;

        await user.save();

        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                active: user.active
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Deletar usuário
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Não permitir deletar a si mesmo
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Você não pode deletar sua própria conta'
            });
        }

        await user.deleteOne();

        res.json({
            success: true,
            message: 'Usuário deletado com sucesso'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Alternar status ativo/inativo
// @route   PATCH /api/users/:id/toggle-active
// @access  Private (Admin)
export const toggleUserActive = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Não permitir desativar a si mesmo
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Você não pode desativar sua própria conta'
            });
        }

        user.active = !user.active;
        await user.save();

        res.json({
            success: true,
            data: {
                id: user._id,
                active: user.active
            }
        });
    } catch (error) {
        next(error);
    }
};
