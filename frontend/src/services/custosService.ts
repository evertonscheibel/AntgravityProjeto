import api from './api';

export const custosService = {
    async getDashboard(params?: any) {
        const response = await api.get('/custos/dashboard', { params });
        return response.data;
    },

    async getLancamentos(params?: any) {
        const response = await api.get('/custos', { params });
        return response.data;
    },

    async createLancamento(data: any) {
        const response = await api.post('/custos', data);
        return response.data;
    },

    async updateLancamento(id: string, data: any) {
        const response = await api.put(`/custos/${id}`, data);
        return response.data;
    },

    async deleteLancamento(id: string) {
        const response = await api.delete(`/custos/${id}`);
        return response.data;
    },

    async getOrcamento(safraId: string) {
        const response = await api.get(`/custos/orcamento/${safraId}`);
        return response.data;
    },

    async createOrcamento(data: any) {
        const response = await api.post('/custos/orcamento', data);
        return response.data;
    },

    async updateOrcamento(id: string, data: any) {
        const response = await api.put(`/custos/orcamento/${id}`, data);
        return response.data;
    }
};

export default custosService;
