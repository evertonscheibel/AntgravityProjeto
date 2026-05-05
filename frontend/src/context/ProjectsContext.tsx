import React, { createContext, useContext, useState, useCallback } from 'react';
import { projectService, Project, BoardData } from '../services/projectService';
import { toast } from 'react-toastify';

interface ProjectsContextType {
    projects: Project[];
    currentBoard: BoardData | null;
    loading: boolean;
    error: string | null;
    fetchProjects: () => Promise<void>;
    fetchProjectBoard: (id: string) => Promise<void>;
    createProject: (data: Partial<Project>) => Promise<void>;
    updateProject: (id: string, data: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    createTask: (projectId: string, data: Partial<any>) => Promise<void>;
    moveTask: (taskId: string, columnId: string) => Promise<void>;
    clearCurrentBoard: () => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentBoard, setCurrentBoard] = useState<BoardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const response = await projectService.getProjects();
            setProjects(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao carregar projetos');
            toast.error('Erro ao carregar projetos');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchProjectBoard = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const response = await projectService.getProjectBoard(id);
            setCurrentBoard(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao carregar board');
            toast.error('Erro ao carregar quadro do projeto');
        } finally {
            setLoading(false);
        }
    }, []);

    const createProject = async (data: Partial<Project>) => {
        setLoading(true);
        try {
            await projectService.createProject(data);
            toast.success('Projeto criado com sucesso!');
            await fetchProjects();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao criar projeto');
            toast.error(err.response?.data?.message || 'Erro ao criar projeto');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateProject = async (id: string, data: Partial<Project>) => {
        setLoading(true);
        try {
            await projectService.updateProject(id, data);
            toast.success('Projeto atualizado!');
            await fetchProjects();
            if (currentBoard && currentBoard.project._id === id) {
                await fetchProjectBoard(id);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Erro ao atualizar projeto');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteProject = async (id: string) => {
        setLoading(true);
        try {
            await projectService.deleteProject(id);
            toast.success('Projeto excluído!');
            await fetchProjects();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Erro ao excluir projeto');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createTask = async (projectId: string, data: Partial<any>) => {
        setLoading(true);
        try {
            await projectService.createTask(projectId, data);
            toast.success('Tarefa criada!');
            // Update board if current
            if (currentBoard && currentBoard.project._id === projectId) {
                await fetchProjectBoard(projectId);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Erro ao criar tarefa');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const moveTask = async (taskId: string, columnId: string) => {
        // Optimistic update logic could go here, for now just API call
        try {
            await projectService.moveTask(taskId, columnId);
            // Silent update or toast? Silent is better for DnD
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Erro ao mover tarefa');
            throw err;
        }
    };

    const clearCurrentBoard = () => {
        setCurrentBoard(null);
    };

    return (
        <ProjectsContext.Provider
            value={{
                projects,
                currentBoard,
                loading,
                error,
                fetchProjects,
                fetchProjectBoard,
                createProject,
                updateProject,
                deleteProject,
                createTask,
                moveTask,
                clearCurrentBoard
            }}
        >
            {children}
        </ProjectsContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectsContext);
    if (!context) {
        throw new Error('useProjects must be used within ProjectsProvider');
    }
    return context;
};
