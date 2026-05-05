import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DashboardNew } from './pages/DashboardNew';
import { Tickets } from './pages/Tickets';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { Notifications } from './pages/Notifications';
import { Users } from './pages/Users';
import { Reports } from './pages/Reports';
import { PublicTicketForm } from './pages/PublicTicketForm';
import PurchaseRequests from './pages/PurchaseRequests';
import Projects from './pages/Projects';
import { ProjectBoard } from './pages/ProjectBoard';
import { ProjectsProvider } from './context/ProjectsContext';
import { GestaoProcessos } from './pages/GestaoProcessos';
import { CiclosHistorico } from './pages/CiclosHistorico';
import { ProcessosRelatorios } from './pages/ProcessosRelatorios';
import { Assets } from './pages/Assets';
import { Maintenances } from './pages/Maintenances';
import { ATS } from './pages/ATS';
import { Almoxarifado } from './pages/Almoxarifado';
import { Fornecedores } from './pages/Fornecedores';
import { Custos } from './pages/Custos';
import { DashboardProcessos } from './pages/DashboardProcessos';
import { SlaughterCalendar } from './pages/slaughter/SlaughterCalendar';
import { SlaughterPreSchedule } from './pages/slaughter/SlaughterPreSchedule';
import { SlaughterSchedule } from './pages/slaughter/SlaughterSchedule';
import { SlaughterClosure } from './pages/slaughter/SlaughterClosure';
import { SlaughterClosureList } from './pages/slaughter/SlaughterClosureList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <ProjectsProvider>
                <ToastContainer position="top-right" autoClose={3000} />
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Routes>
                        {/* Rota pública - sem autenticação */}
                        <Route path="/ticket/new" element={<PublicTicketForm />} />

                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <DashboardNew />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/solicitacoes"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <Tickets />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/knowledge-base"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <KnowledgeBase />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/reports"
                            element={
                                <PrivateRoute roles={['admin', 'tecnico']}>
                                    <Layout>
                                        <Reports />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/notifications"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <Notifications />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/purchase-requests"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <PurchaseRequests />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/users"
                            element={
                                <PrivateRoute roles={['admin']}>
                                    <Layout>
                                        <Users />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/projetos"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <Projects />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/projetos/:id/board"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <ProjectBoard />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/processos"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <GestaoProcessos />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/processos/ciclos"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <CiclosHistorico />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/processos/relatorios"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <ProcessosRelatorios />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/patrimonios"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <Assets />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/manutencoes"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <Maintenances />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/almoxarifado"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <Almoxarifado />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/ats"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <ATS />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />

                        {/* Rotas de Indústria / Abate */}
                        <Route
                            path="/slaughter/calendar"
                            element={
                                <PrivateRoute roles={['admin', 'tecnico', 'manager']}>
                                    <Layout>
                                        <SlaughterCalendar />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/slaughter/pre-schedule/:date"
                            element={
                                <PrivateRoute roles={['admin', 'tecnico', 'manager']}>
                                    <Layout>
                                        <SlaughterPreSchedule />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/slaughter/schedule"
                            element={
                                <PrivateRoute roles={['admin', 'tecnico', 'manager']}>
                                    <Navigate to={`/slaughter/schedule/${new Date().toISOString().split('T')[0]}`} replace />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/slaughter/schedule/:date"
                            element={
                                <PrivateRoute roles={['admin', 'tecnico', 'manager']}>
                                    <Layout>
                                        <SlaughterSchedule />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/slaughter/closure/:date"
                            element={
                                <PrivateRoute roles={['admin', 'tecnico', 'manager']}>
                                    <Layout>
                                        <SlaughterClosure />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                         <Route
                            path="/slaughter/closure-list"
                            element={
                                <PrivateRoute roles={['admin', 'tecnico', 'manager']}>
                                    <Layout>
                                        <SlaughterClosureList />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </BrowserRouter>
            </ProjectsProvider>
        </AuthProvider>
    );
}

export default App;
