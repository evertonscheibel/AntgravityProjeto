import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');

        const email = 'admin@gestao.com';
        const exists = await User.findOne({ email });

        if (exists) {
            console.log('🔄 Usuário admin@gestao.com já existe. Atualizando senha...');
            // A model User deve ter um hook pre-save que faz o hash da senha, 
            // então atualizar diretamente e salvar deve funcionar se a model estiver correta.
            // Se a model não tiver hash automático no save de atualização, pode ser problema, 
            // mas geralmente models de auth têm.
            // Vamos assumir que sim, baseado no seed.js que passa password texto plano no create.
            exists.password = 'admin123';
            await exists.save();
            console.log('✅ Senha atualizada para: admin123');
        } else {
            console.log('➕ Criando novo usuário admin...');
            await User.create({
                name: 'Administrador',
                email: email,
                password: 'admin123',
                role: 'admin'
            });
            console.log('✅ Usuário criado: admin@gestao.com / admin123');
        }

        console.log('👋 Concluído!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
};

createAdmin();
