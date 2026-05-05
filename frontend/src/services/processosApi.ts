import api from './api';

// ============ Types ============
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface Cycle {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'OPEN' | 'CLOSED';
    companyId: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProcessItem {
    _id: string;
    cycleId: string;
    title: string;
    description: string;
    sector: string;
    category: string;
    responsible: string;
    responsibleName?: string;
    deadline: string;
    deliveredAt?: string;
    status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
    score: number;
    evidence?: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProcessosSummary {
    totalProcesses: number;
    completed: number;
    pending: number;
    overdue: number;
    onTimePercentage: number;
    averageScore: number;
    byStatus: Array<{ _id: string; count: number }>;
    bySector: Array<{ _id: string; count: number; avgScore: number }>;
}

// ============ Cycles ============
export const cyclesService = {
    list: () => api.get<ApiResponse<Cycle[]>>('/processos/ciclos'),
    getCurrent: () => api.get<ApiResponse<Cycle>>('/processos/ciclos/atual'),
    create: (data: { name: string; startDate: string; endDate: string }) =>
        api.post<ApiResponse<Cycle>>('/processos/ciclos', data),
    close: (id: string) => api.put<ApiResponse<Cycle>>(`/processos/ciclos/${id}/fechar`),
};

// ============ Process Items ============
export const processosService = {
    list: (cycleId?: string, sector?: string) => {
        const params = new URLSearchParams();
        if (cycleId) params.append('cycleId', cycleId);
        if (sector) params.append('sector', sector);
        return api.get<ApiResponse<ProcessItem[]>>(`/processos?${params.toString()}`);
    },
    create: (data: Partial<ProcessItem>) =>
        api.post<ApiResponse<ProcessItem>>('/processos', data),
    update: (id: string, data: Partial<ProcessItem>) =>
        api.put<ApiResponse<ProcessItem>>(`/processos/${id}`, data),
    deliver: (id: string, data: { deliveredAt: string; evidence?: string }) =>
        api.put<ApiResponse<ProcessItem>>(`/processos/${id}/entregar`, data),
    delete: (id: string) => api.delete<ApiResponse<any>>(`/processos/${id}`),
};

// ============ Reports ============
export const processosReportsService = {
    getSummary: (filters: { cycleId?: string; sector?: string; category?: string } = {}) => {
        const params = new URLSearchParams();
        if (filters.cycleId) params.append('cycleId', filters.cycleId);
        if (filters.sector) params.append('sector', filters.sector);
        if (filters.category) params.append('category', filters.category);
        
        return api.get<ApiResponse<ProcessosSummary>>(`/processos/relatorios?${params.toString()}`);
    },
};

// ============ Users (for responsible dropdown) ============
export const processosUsersService = {
    list: () => api.get<ApiResponse<Array<{ _id: string; name: string; role: string }>>>('/users'),
};
