import cron from 'node-cron';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Verificar certificados expirando (diariamente às 00:00)
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('🔍 Verificando certificados expirando...');
        const response = await axios.post(`${API_URL}/certificates/check-expiration`);
        console.log('✅ Verificação de certificados concluída:', response.data);
    } catch (error) {
        console.error('❌ Erro ao verificar certificados:', error.message);
    }
});

// Verificar boletos próximos do vencimento (diariamente às 08:00)
cron.schedule('0 8 * * *', async () => {
    try {
        console.log('🔍 Verificando boletos próximos do vencimento...');
        const response = await axios.post(`${API_URL}/boletos/check-due`);
        console.log('✅ Verificação de boletos concluída:', response.data);
    } catch (error) {
        console.error('❌ Erro ao verificar boletos:', error.message);
    }
});

// Previsão de Escalas: Alerta para logística (diariamente às 07:00)
// Verifica escalas nos próximos 3 dias
cron.schedule('0 7 * * *', async () => {
    try {
        const Notification = (await import('../models/Notification.js')).default;
        const SlaughterPreSchedule = (await import('../models/SlaughterPreSchedule.js')).default;
        const User = (await import('../models/User.js')).default;

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 3);

        const upcomingSchedules = await SlaughterPreSchedule.find({
            date: { $gte: new Date(), $lte: targetDate },
            status: { $ne: 'CANCELADA' }
        });

        if (upcomingSchedules.length > 0) {
            const logisticsUsers = await User.find({ role: { $in: ['admin', 'manager', 'coordenador'] } });
            
            for (const schedule of upcomingSchedules) {
                for (const user of logisticsUsers) {
                    await Notification.create({
                        user: user._id,
                        type: 'sistema',
                        priority: 'media',
                        message: `Alerta de Logística: Escala prevista para ${new Date(schedule.date).toLocaleDateString()} necessita validação de transporte.`
                    });
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro no cron de logística:', error.message);
    }
});

// Alerta de Estoque Mínimo e Reposição Automática (diariamente às 06:00)
cron.schedule('0 6 * * *', async () => {
    try {
        const Notification = (await import('../models/Notification.js')).default;
        const Insumo = (await import('../models/Insumo.js')).default;
        const User = (await import('../models/User.js')).default;
        const PurchaseRequest = (await import('../models/PurchaseRequest.js')).default;

        const lowStockItems = await Insumo.find({
            $expr: { $lte: ['$quantidade_atual', '$quantidade_minima'] },
            ativo: true
        });

        if (lowStockItems.length > 0) {
            const adminUser = await User.findOne({ role: 'admin' });
            const purchasingUsers = await User.find({ role: { $in: ['admin', 'manager', 'financeiro'] } });
            
            for (const item of lowStockItems) {
                // 1. Criar Notificações para Gestores
                for (const user of purchasingUsers) {
                    await Notification.create({
                        user: user._id,
                        type: 'sistema',
                        priority: 'alta',
                        message: `Alerta de Estoque: O item "${item.nome}" atingiu o nível crítico (${item.quantidade_atual} ${item.unidade}).`
                    });
                }

                // 2. Criar Solicitação de Compra (PurchaseRequest) Automática se não houver uma pendente
                const existingRequest = await PurchaseRequest.findOne({
                    status: { $in: ['rascunho', 'aguardando_cotacao', 'em_cotacao'] },
                    title: new RegExp(item.nome, 'i')
                });

                if (!existingRequest && adminUser) {
                    await PurchaseRequest.create({
                        title: `Reposição Automática - ${item.nome}`,
                        description: `Solicitação gerada automaticamente pelo sistema devido ao baixo estoque (${item.quantidade_atual} ${item.unidade}).`,
                        quantity: item.quantidade_minima > 0 ? item.quantidade_minima * 2 : 10,
                        estimatedValue: item.custo_unitario || 0,
                        totalValue: 0, // Calculado no pre-save
                        department: 'Almoxarifado',
                        requester: adminUser._id,
                        urgency: 'alta',
                        justification: 'Estoque atingiu o nível de segurança definido.',
                        status: 'rascunho'
                    });
                    console.log(`📦 Solicitação de compra criada para: ${item.nome}`);
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro no cron de estoque:', error.message);
    }
});

console.log('⏰ Cron jobs iniciados');

export default cron;
