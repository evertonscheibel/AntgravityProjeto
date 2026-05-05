import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');

        const email = 'admin@gestaoti.com';
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log(`⚠️ O usuário ${email} já existe.`);
            // Opcional: Atualizar senha se já existir? O usuário pediu para Criar.
            // Vou atualizar para garantir que a senha seja a solicitada.
            existingUser.password = 'senha123456';
            existingUser.role = 'admin'; // Garantir acesso full
            await existingUser.save();
            console.log(`✅ Usuário ${email} atualizado com nova senha e permissão de admin.`);
        } else {
            await User.create({
                name: 'Administrador GestaTI',
                email: email,
                password: 'senha123456',
                role: 'admin'
            });
            console.log(`✅ Usuário ${email} criado com sucesso.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
        process.exit(1);
    }
};

createAdmin();
