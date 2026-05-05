import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Plus, Folder, Calendar, Users, Target } from 'lucide-react';
import ProjectModal from '../components/ProjectModal';
import { projectService, Project } from '../services/projectService';
import './Projects.css';

const Projects: React.FC = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await projectService.getProjects();
            // projectService now returns the data body directly: { success: true, data: [] }
            setProjects(response.data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: any) => {
        setLoading(true);
        try {
            await projectService.createProject(data);
            setShowModal(false);
            fetchProjects();
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return '#10B981';
            case 'PLANNING': return '#3B82F6';
            case 'HOLD': return '#F59E0B';
            case 'COMPLETED': return '#2d6a4f';
            default: return '#6B7280';
        }
    };

    return (
        <Layout>
            <div className="projects-container">
                <div className="projects-header">
                    <p className="projects-subtitle">Gerencie projetos e acompanhe o progresso da equipe</p>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={20} />
                        Novo Projeto
                    </button>
                </div>

                {loading ? (
                    <div className="loading">Carregando projetos...</div>
                ) : (
                    <div className="projects-grid">
                        {Array.isArray(projects) && projects.length > 0 ? (
                            projects.map((project) => (
                                <div
                                    key={project._id}
                                    className="project-card"
                                    onClick={() => navigate(`/projetos/${project._id}/board`)}
                                >
                                    <div className="project-card-header">
                                        <div className="project-icon">
                                            <Folder size={24} />
                                        </div>
                                        <span
                                            className="status-badge"
                                            style={{ backgroundColor: `${getStatusColor(project.status)}20`, color: getStatusColor(project.status) }}
                                        >
                                            {project.status}
                                        </span>
                                    </div>
                                    <h3>{project.name}</h3>
                                    <p className="project-desc">{project.description}</p>

                                    <div className="project-meta">
                                        <div className="meta-item">
                                            <Target size={16} />
                                            <span>{project.methodology}</span>
                                        </div>
                                        <div className="meta-item">
                                            <Users size={16} />
                                            <span>{project.manager?.name}</span>
                                        </div>
                                        <div className="meta-item">
                                            <Calendar size={16} />
                                            <span>{new Date(project.startDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-projects">Nenhum projeto encontrado.</div>
                        )}
                    </div>
                )}

                <ProjectModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handleSubmit}
                    loading={loading}
                />
            </div>
        </Layout>
    );
};

export default Projects;
