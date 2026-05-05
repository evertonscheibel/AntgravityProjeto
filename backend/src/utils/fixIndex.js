import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const fixIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado ao MongoDB');
        const db = mongoose.connection.db;
        const collections = await db.listCollections({ name: 'tickets' }).toArray();
        if (collections.length > 0) {
            console.log('Removendo índice ticketNumber_1...');
            await db.collection('tickets').dropIndex('ticketNumber_1');
            console.log('Índice removido!');
        }
        process.exit(0);
    } catch (error) {
        console.error('Erro:', error);
        process.exit(1);
    }
};

fixIndex();
