import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Fazenda from '../models/Fazenda.js';
import Talhao from '../models/Talhao.js';
import Safra from '../models/Safra.js';
import Manejo from '../models/Manejo.js';
import Insumo from '../models/Insumo.js';
import MovimentacaoInsumo from '../models/MovimentacaoInsumo.js';

dotenv.config();

const seedAgro = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB conectado para Seed Agro');

        // Limpar coleções para garantir seed limpo
        await User.deleteMany({ email: { $in: ['admin@campoflow.com', 'coordenadora@campoflow.com', 'agronomo@campoflow.com', 'joao@campoflow.com', 'financeiro@campoflow.com'] } });
        await Fazenda.deleteMany({});
        await Talhao.deleteMany({});
        await Safra.deleteMany({});
        await Manejo.deleteMany({});
        await Insumo.deleteMany({});
        await MovimentacaoInsumo.deleteMany({});

        const hashedPassword = await bcrypt.hash('agro123', 10);

        // 1. Criar Usuários
        const users = await User.create([
            { name: 'Admin CampoFlow', email: 'admin@campoflow.com', password: 'admin123', role: 'admin' },
            { name: 'Coordenadora Ana', email: 'coordenadora@campoflow.com', password: 'coord123', role: 'coordenador' },
            { name: 'Agrônomo Lucas', email: 'agronomo@campoflow.com', password: 'agro123', role: 'agronomo' },
            { name: 'João Operador', email: 'joao@campoflow.com', password: 'campo123', role: 'operador' },
            { name: 'Financeiro Carla', email: 'financeiro@campoflow.com', password: 'fin123', role: 'financeiro' }
        ]);

        console.log('👤 Usuários criados');

        // 2. Criar Fazendas
        const fazendas = await Fazenda.create([
            {
                nome: 'Fazenda Santa Rita',
                apelido: 'Santa Rita',
                municipio: 'Sorriso',
                estado: 'MT',
                area_total_ha: 1500,
                responsavel_id: users[0]._id
            },
            {
                nome: 'Fazenda Boa Esperança',
                apelido: 'Boa Esperança',
                municipio: 'Rio Verde',
                estado: 'GO',
                area_total_ha: 1200,
                responsavel_id: users[0]._id
            }
        ]);

        console.log('🏡 Fazendas criadas');

        // Atualizar usuários com acesso às fazendas
        await User.updateMany({}, { $set: { fazendas_acesso: fazendas.map(f => f._id) } });

        // 3. Criar Talhões
        const talhoes = await Talhao.create([
            { fazenda_id: fazendas[0]._id, nome: 'Talhão 01', area_ha: 150, tipo_solo: 'argiloso', topografia: 'plano' },
            { fazenda_id: fazendas[0]._id, nome: 'Talhão 02', area_ha: 200, tipo_solo: 'misto', topografia: 'ondulado' },
            { fazenda_id: fazendas[1]._id, nome: 'Talhão Norte 1', area_ha: 100, tipo_solo: 'arenoso', topografia: 'plano' },
            { fazenda_id: fazendas[1]._id, nome: 'Talhão Sul 2', area_ha: 180, tipo_solo: 'argiloso', topografia: 'acidentado' }
        ]);

        console.log('🌱 Talhões criados');

        // 4. Criar Safras
        const safras = await Safra.create([
            {
                fazenda_id: fazendas[0]._id,
                nome: 'Soja 2024/2025',
                cultura: 'Soja',
                variedade: 'TMG 7062 IPRO',
                status_geral: 'em_andamento',
                responsavel_agronomo: users[2]._id,
                talhoes: [
                    { talhao_id: talhoes[0]._id, area_plantada_ha: 150, status: 'plantado', data_plantio: new Date('2024-10-15') },
                    { talhao_id: talhoes[1]._id, area_plantada_ha: 200, status: 'plantado', data_plantio: new Date('2024-10-20') }
                ],
                fases: [
                    { nome: 'preparo_solo', concluida: true, data_inicio_real: new Date('2024-09-01'), data_fim_real: new Date('2024-10-10') },
                    { nome: 'plantio', concluida: true, data_inicio_real: new Date('2024-10-15'), data_fim_real: new Date('2024-10-25') },
                    { nome: 'tratos_culturais', concluida: false, data_inicio_real: new Date('2024-11-01') }
                ]
            }
        ]);

        console.log('🌾 Safras criadas');

        // 5. Criar Insumos
        const insumos = await Insumo.create([
            {
                fazenda_id: fazendas[0]._id,
                nome: 'Glifosato 480',
                tipo: 'defensivo_herbicida',
                unidade: 'L',
                quantidade_atual: 500,
                quantidade_minima: 100,
                custo_unitario: 45
            },
            {
                fazenda_id: fazendas[0]._id,
                nome: 'NPK 04-14-08',
                tipo: 'fertilizante_solo',
                unidade: 'kg',
                quantidade_atual: 5000,
                quantidade_minima: 1000,
                custo_unitario: 3.5
            }
        ]);

        console.log('📦 Insumos criados');

        // 6. Criar Manejos
        await Manejo.create([
            {
                fazenda_id: fazendas[0]._id,
                safra_id: safras[0]._id,
                talhao_id: talhoes[0]._id,
                tipo: 'aplicacao_defensivo',
                descricao: 'Aplicação de herbicida pré-emergente',
                responsavel_id: users[2]._id,
                aplicacao: {
                    produto: 'Glifosato 480',
                    dose_ha: 2,
                    unidade: 'L/ha',
                    area_applied_ha: 150
                }
            }
        ]);

        console.log('🧪 Manejos criados');
        console.log('✅ Seed Agro concluído com sucesso!');
        process.exit();
    } catch (error) {
        console.error('❌ Erro no seed:', error);
        process.exit(1);
    }
};

seedAgro();
