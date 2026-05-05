import api from './api';

export const fazendaService = {
    async getAll() {
        const response = await api.get('/fazendas');
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(`/fazendas/${id}`);
        return response.data;
    },

    async create(data: any) {
        const response = await api.post('/fazendas', data);
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(`/fazendas/${id}`, data);
        return response.data;
    }
};

export default fazendaService;
