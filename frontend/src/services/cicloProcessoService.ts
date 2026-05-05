import api from './api';

export const cicloProcessoService = {
    async getDashboard(params?: any) {
        const response = await api.get('/ciclos-processo/dashboard', { params });
        return response.data;
    },

    async getAll(params?: any) {
        const response = await api.get('/ciclos-processo', { params });
        return response.data;
    },

    async create(data: any) {
        const response = await api.post('/ciclos-processo', data);
        return response.data;
    },

    async getRendimento(params?: any) {
        const response = await api.get('/ciclos-processo/rendimento-equipe', { params });
        return response.data;
    }
};

export default cicloProcessoService;
