import api from './api';

export interface Ticket {
    _id: string;
    title: string;
    description: string;
    category: string;
    priority: 'baixa' | 'media' | 'alta' | 'critica';
    status: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado';
    requester: any;
    assignedTo?: any;
    asset?: any;
    comments: any[];
    attachments: any[];
    createdAt: string;
    updatedAt: string;
    relatedTaskId?: string; // ID da tarefa vinculada
    resolvedAt?: string;
}

export const ticketService = {
    async getAll(params?: any) {
        const response = await api.get('/tickets', { params });
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(`/tickets/${id}`);
        return response.data;
    },

    async create(data: Partial<Ticket>) {
        const response = await api.post('/tickets', data);
        return response.data;
    },

    async update(id: string, data: Partial<Ticket>) {
        const response = await api.put(`/tickets/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/tickets/${id}`);
        return response.data;
    },

    async addComment(id: string, comment: string) {
        const response = await api.post(`/tickets/${id}/comments`, { comment });
        return response.data;
    },

    async getStats() {
        const response = await api.get('/tickets/stats/summary');
        return response.data;
    }
};
