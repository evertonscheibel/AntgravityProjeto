import api from './api';

export const fornecedorService = {
    async getAll(params?: any) {
        const response = await api.get('/fornecedores', { params });
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(`/fornecedores/${id}`);
        return response.data;
    },

    async create(data: any) {
        const response = await api.post('/fornecedores', data);
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(`/fornecedores/${id}`, data);
        return response.data;
    },

    async updateStatus(id: string, status: string, motivo?: string) {
        const response = await api.patch(`/fornecedores/${id}/status`, { status, motivo_bloqueio: motivo });
        return response.data;
    },

    async createAvaliacao(id: string, data: any) {
        const response = await api.post(`/fornecedores/${id}/avaliacao`, data);
        return response.data;
    },

    async getAvaliacoes(id: string) {
        const response = await api.get(`/fornecedores/${id}/avaliacoes`);
        return response.data;
    },

    async getRanking(categoria?: string) {
        const response = await api.get('/fornecedores/ranking/por-categoria', { params: { categoria } });
        return response.data;
    }
};

export default fornecedorService;
