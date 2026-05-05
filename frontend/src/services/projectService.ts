import api from './api';

export interface Project {
    _id: string;
    name: string;
    description?: string;
    manager: {
        _id: string;
        name: string;
    };
    members: {
        _id: string;
        name: string;
    }[];
    status: 'PLANNING' | 'ACTIVE' | 'HOLD' | 'COMPLETED' | 'ARCHIVED';
    progress?: number;
    startDate: string;
    endDate?: string;
    methodology: 'KANBAN' | 'SCRUM';
    createdAt: string;
}

export interface ProjectTask {
    _id: string;
    title: string;
    description?: string;
    status: string; // Column ID
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignedTo?: {
        _id: string;
        name: string;
    };
    linkedTicket?: {
        _id: string;
        title: string;
        status: string;
    };
    storyPoints?: number;
    tags?: string[];
    createdAt: string;
}

export interface ProjectColumn {
    _id: string;
    name: string;
    order: number;
    limit: number;
}

export interface BoardData {
    project: Project;
    columns: ProjectColumn[];
    tasks: ProjectTask[];
}

export const projectService = {
    getProjects: async () => {
        const response = await api.get<{ success: true; data: Project[] }>('/projects');
        return response.data;
    },

    getProjectBoard: async (id: string) => {
        const response = await api.get<{ success: true; data: BoardData }>(`/projects/${id}`);
        return response.data;
    },

    createProject: async (data: Partial<Project>) => {
        const response = await api.post<{ success: true; data: Project }>('/projects', data);
        return response.data;
    },

    updateProject: async (id: string, data: Partial<Project>) => {
        const response = await api.put<{ success: true; data: Project }>(`/projects/${id}`, data);
        return response.data;
    },

    deleteProject: async (id: string) => {
        const response = await api.delete(`/projects/${id}`);
        return response.data;
    },

    createTask: async (projectId: string, data: Partial<ProjectTask>) => {
        const response = await api.post<{ success: true; data: ProjectTask }>(`/projects/${projectId}/tasks`, { ...data, projectId });
        return response.data;
    },

    moveTask: async (taskId: string, columnId: string) => {
        const response = await api.put<{ success: true; data: ProjectTask }>(`/projects/tasks/${taskId}/move`, { columnId });
        return response.data;
    },

    linkTicket: async (taskId: string, ticketId: string) => {
        return api.post(`/projects/tasks/${taskId}/link-ticket`, { ticketId });
    },

    createFromTicket: async (projectId: string, ticketId: string) => {
        return api.post(`/projects/tasks/from-ticket`, { projectId, ticketId });
    }
};
