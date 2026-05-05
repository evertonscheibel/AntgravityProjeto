import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Search, UserCheck, Briefcase, Mail, Phone, ExternalLink, Trash2, Edit, AlertCircle } from 'lucide-react';
import { atsService } from '../services';
import VacancyModal from '../components/VacancyModal';
import CandidateModal from '../components/CandidateModal';
import '../pages/Tickets.css';

export const ATS: React.FC = () => {
    const [vacancies, setVacancies] = useState<any[]>([]);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'vagas' | 'candidatos'>('vagas');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [showVacancyModal, setShowVacancyModal] = useState(false);
    const [showCandidateModal, setShowCandidateModal] = useState(false);
    const [selectedVacancy, setSelectedVacancy] = useState<any>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [vacRes, candRes] = await Promise.all([
                atsService.getVacancies(),
                atsService.getCandidates()
            ]);
            setVacancies(vacRes.data || []);
            setCandidates(candRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados ATS:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveVacancy = async (data: any) => {
        setActionLoading(true);
        try {
            if (selectedVacancy) {
                await atsService.updateVacancy(selectedVacancy._id, data);
            } else {
                await atsService.createVacancy(data);
            }
            setShowVacancyModal(false);
            loadData();
        } catch (error) {
            console.error('Erro ao salvar vaga:', error);
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveCandidate = async (data: any) => {
        setActionLoading(true);
        try {
            if (selectedCandidate) {
                await atsService.updateCandidate(selectedCandidate._id, data);
            } else {
                await atsService.createCandidate(data);
            }
            setShowCandidateModal(false);
            loadData();
        } catch (error) {
            console.error('Erro ao salvar candidato:', error);
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteVacancy = async (id: string) => {
        if (!window.confirm('Excluir esta vaga permanentemente?')) return;
        try {
            await atsService.deleteVacancy(id);
            loadData();
        } catch (error) {
            alert('Erro ao excluir vaga');
        }
    };

    const handleDeleteCandidate = async (id: string) => {
        if (!window.confirm('Remover este candidato do sistema?')) return;
        try {
            await atsService.deleteCandidate(id);
            loadData();
        } catch (error) {
            alert('Erro ao excluir candidato');
        }
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            OPEN: '#10b981',
            CLOSED: '#ef4444',
            ARCHIVED: '#64748b',
            APPLIED: '#3b82f6',
            HIRED: '#10b981',
            REJECTED: '#ef4444'
        };
        return colors[status] || '#64748b';
    };

    if (loading && (vacancies.length === 0 && candidates.length === 0)) {
        return <div className="loading-container"><div className="spinner"></div><p>Carregando ATS...</p></div>;
    }

    return (
        <div className="tickets-page">
            <div className="page-header">
                <div>
                    <h1>ATS - Recrutamento</h1>
                    <p>Gestão de vagas e candidatos</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className={`btn-tab ${activeTab === 'vagas' ? 'active' : ''}`} onClick={() => setActiveTab('vagas')}>
                        Vagas
                    </button>
                    <button className={`btn-tab ${activeTab === 'candidatos' ? 'active' : ''}`} onClick={() => setActiveTab('candidatos')}>
                        Candidatos
                    </button>
                    <button
                        className="btn-primary"
                        style={{ marginLeft: '10px' }}
                        onClick={() => {
                            if (activeTab === 'vagas') {
                                setSelectedVacancy(null);
                                setShowVacancyModal(true);
                            } else {
                                setSelectedCandidate(null);
                                setShowCandidateModal(true);
                            }
                        }}
                    >
                        <Plus size={20} /> {activeTab === 'vagas' ? 'Nova Vaga' : 'Novo Candidato'}
                    </button>
                </div>
            </div>

            <div className="tickets-toolbar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder={`Buscar ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="tickets-table-container">
                <table className="tickets-table">
                    <thead>
                        {activeTab === 'vagas' ? (
                            <tr>
                                <th>Título</th>
                                <th>Setor</th>
                                <th>Status</th>
                                <th>Criação</th>
                                <th>Ações</th>
                            </tr>
                        ) : (
                            <tr>
                                <th>Nome</th>
                                <th>Vaga</th>
                                <th>Email/Tel</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {activeTab === 'vagas' ? (
                            vacancies.filter(v => v.title.toLowerCase().includes(searchTerm.toLowerCase())).map(v => (
                                <tr key={v._id}>
                                    <td><strong>{v.title}</strong></td>
                                    <td>{v.sector}</td>
                                    <td>
                                        <span className="status-badge" style={{ backgroundColor: getStatusColor(v.status) }}>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon" onClick={() => {
                                                    setSelectedVacancy(v);
                                                    setShowVacancyModal(true);
                                                }}>
                                                    <Edit size={16} />
                                                </button>
                                                <button className="btn-icon danger" onClick={() => handleDeleteVacancy(v._id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            candidates.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                                <tr key={c._id}>
                                    <td><strong>{c.name}</strong></td>
                                    <td>{c.vacancy?.title}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                                            <span>{c.email}</span>
                                            <span>{c.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-badge" style={{ backgroundColor: getStatusColor(c.status) }}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon" onClick={() => {
                                                    setSelectedCandidate(c);
                                                    setShowCandidateModal(true);
                                                }}>
                                                    <Edit size={16} />
                                                </button>
                                                <button className="btn-icon danger" onClick={() => handleDeleteCandidate(c._id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <VacancyModal
                isOpen={showVacancyModal}
                vacancy={selectedVacancy}
                onClose={() => setShowVacancyModal(false)}
                onSave={handleSaveVacancy}
                loading={actionLoading}
            />

            <CandidateModal
                isOpen={showCandidateModal}
                candidate={selectedCandidate}
                vacancies={vacancies}
                onClose={() => setShowCandidateModal(false)}
                onSave={handleSaveCandidate}
                loading={actionLoading}
            />
        </div>
    );
};
