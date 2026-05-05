import api from './api';

export const dashboardService = {
    async getKPIs() {
        const response = await api.get('/dashboard/kpis');
        return response.data;
    },

    async getRecentActivity(limit = 10) {
        const response = await api.get('/dashboard/recent-activity', {
            params: { limit }
        });
        return response.data;
    },

    async getOperational() {
        const response = await api.get('/dashboard/operational');
        return response.data;
    },

    async getAlerts() {
        const response = await api.get('/dashboard/alerts');
        return response.data;
    }
};

export const assetService = {
    async getAll(params?: any) {
        const response = await api.get('/assets', { params });
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(`/assets/${id}`);
        return response.data;
    },

    async getWithDetails(id: string) {
        const response = await api.get(`/assets/${id}/details`);
        return response.data;
    },

    async create(data: any) {
        const response = await api.post('/assets', data);
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(`/assets/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/assets/${id}`);
        return response.data;
    },

    async getReport() {
        const response = await api.get('/assets/reports/analytics');
        return response.data;
    },

    async importAssets(formData: FormData) {
        const response = await api.post('/assets/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    async exportAssets() {
        const response = await api.get('/assets/export', {
            responseType: 'blob'
        });
        return response.data;
    }
};

export const certificateService = {
    async getAll(params?: any) {
        const response = await api.get('/certificates', { params });
        return response.data;
    },

    async getExpiring(days = 30) {
        const response = await api.get('/certificates/expiring/soon', {
            params: { days }
        });
        return response.data;
    },

    async create(data: any) {
        const response = await api.post('/certificates', data);
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(`/certificates/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/certificates/${id}`);
        return response.data;
    }
};

export const kbService = {
    async getAll(params?: any) {
        const response = await api.get('/kb', { params });
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(`/kb/${id}`);
        return response.data;
    },

    async search(query: string) {
        const response = await api.get('/kb/search/related', {
            params: { query }
        });
        return response.data;
    },

    async create(data: any) {
        const response = await api.post('/kb', data);
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(`/kb/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/kb/${id}`);
        return response.data;
    },

    async incrementViews(id: string) {
        const response = await api.put(`/kb/${id}/views`);
        return response.data;
    }
};

export const boletoService = {
    async getAll(params?: any) {
        const response = await api.get('/boletos', { params });
        return response.data;
    },

    async getPending() {
        const response = await api.get('/boletos/pending/list');
        return response.data;
    },

    async create(data: any) {
        const response = await api.post('/boletos', data);
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(`/boletos/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/boletos/${id}`);
        return response.data;
    }
};

export const notificationService = {
    async getAll(isRead?: boolean) {
        const response = await api.get('/notifications', {
            params: isRead !== undefined ? { isRead } : {}
        });
        return response.data;
    },

    async markAsRead(id: string) {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },

    async markAllAsRead() {
        const response = await api.put('/notifications/read-all');
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    }
};

export const atsService = {
    async getVacancies(params?: any) {
        const response = await api.get('/ats/vacancies', { params });
        return response.data;
    },
    async createVacancy(data: any) {
        const response = await api.post('/ats/vacancies', data);
        return response.data;
    },
    async updateVacancy(id: string, data: any) {
        const response = await api.put(`/ats/vacancies/${id}`, data);
        return response.data;
    },
    async deleteVacancy(id: string) {
        const response = await api.delete(`/ats/vacancies/${id}`);
        return response.data;
    },
    async getCandidates(params?: any) {
        const response = await api.get('/ats/candidates', { params });
        return response.data;
    },
    async createCandidate(data: any) {
        const response = await api.post('/ats/candidates', data);
        return response.data;
    },
    async updateCandidate(id: string, data: any) {
        const response = await api.put(`/ats/candidates/${id}`, data);
        return response.data;
    },
    async deleteCandidate(id: string) {
        const response = await api.delete(`/ats/candidates/${id}`);
        return response.data;
    }
};

export const almoxarifadoService = {
    async getProducts(params?: any) {
        const response = await api.get('/almoxarifado/products', { params });
        return response.data;
    },
    async createProduct(data: any) {
        const response = await api.post('/almoxarifado/products', data);
        return response.data;
    },
    async updateProduct(id: string, data: any) {
        const response = await api.put(`/almoxarifado/products/${id}`, data);
        return response.data;
    },
    async deleteProduct(id: string) {
        const response = await api.delete(`/almoxarifado/products/${id}`);
        return response.data;
    },
    async getMovements(params?: any) {
        const response = await api.get('/almoxarifado/movements', { params });
        return response.data;
    },
    async createMovement(data: any) {
        const response = await api.post('/almoxarifado/movements', data);
        return response.data;
    }
};

export const purchaseRequestService = {
    async getAll(params?: any) {
        const response = await api.get('/purchase-requests', { params });
        return response.data;
    },
    async getById(id: string) {
        const response = await api.get(`/purchase-requests/${id}`);
        return response.data;
    },
    async create(data: any) {
        const response = await api.post('/purchase-requests', data);
        return response.data;
    },
    async update(id: string, data: any) {
        const response = await api.put(`/purchase-requests/${id}`, data);
        return response.data;
    },
    async delete(id: string) {
        const response = await api.delete(`/purchase-requests/${id}`);
        return response.data;
    },
    async submit(id: string) {
        const response = await api.post(`/purchase-requests/${id}/submit`);
        return response.data;
    },
    async approve(id: string, data: { action: 'aprovar' | 'rejeitar', comments: string }) {
        const response = await api.post(`/purchase-requests/${id}/approve`, data);
        return response.data;
    },
    async createAsset(id: string, data: any) {
        const response = await api.post(`/purchase-requests/${id}/create-asset`, data);
        return response.data;
    }
};

export { default as maintenanceService } from './maintenanceService';
export { default as assetTimelineService } from './assetTimelineService';
export { default as problemService } from './problemService';
export * from './ticketService';
export * from './projectService';
export * from './userService';
export { fornecedorService } from './fornecedorService';
export { fazendaService } from './fazendaService';
export { custosService } from './custosService';
export { cicloProcessoService } from './cicloProcessoService';


