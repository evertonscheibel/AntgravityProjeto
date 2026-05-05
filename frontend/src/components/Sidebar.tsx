import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    BookOpen,
    Bell,
    Users,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    BarChart3,
    ShoppingCart,
    Target,
    RefreshCw,
    HardDrive,
    Box,
    UserCheck,
    MessageSquare,
    Building2,
    DollarSign,
    FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

interface MenuItem {
    path: string;
    icon: any;
    label: string;
    roles: string[];
    group: 'operacoes' | 'recursos';
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const menuItems: MenuItem[] = [
        // Grupo Operações
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'tecnico', 'cliente', 'manager'], group: 'operacoes' },
        { path: '/solicitacoes', icon: MessageSquare, label: 'Solicitações', roles: ['admin', 'tecnico', 'cliente', 'manager'], group: 'operacoes' },
        { path: '/patrimonios', icon: HardDrive, label: 'Patrimônios', roles: ['admin', 'tecnico', 'manager'], group: 'operacoes' },
        { path: '/manutencoes', icon: ClipboardList, label: 'Manutenções (O.S.)', roles: ['admin', 'tecnico', 'manager'], group: 'operacoes' },
        { path: '/projetos', icon: Target, label: 'Projetos de Campo', roles: ['admin', 'manager', 'tecnico'], group: 'operacoes' },
        { path: '/custos', icon: DollarSign, label: 'Custos & Safra', roles: ['admin', 'manager'], group: 'operacoes' },
        { path: '/processos-dashboard', icon: BarChart3, label: 'Dashboard Processos', roles: ['admin', 'manager'], group: 'operacoes' },
        { path: '/processos', icon: RefreshCw, label: 'Gestão de Processos', roles: ['admin', 'manager', 'tecnico', 'cliente'], group: 'operacoes' },

        // Grupo Recursos
        { path: '/almoxarifado', icon: Box, label: 'Almoxarifado', roles: ['admin', 'tecnico', 'manager'], group: 'recursos' },
        { path: '/ats', icon: UserCheck, label: 'ATS - Vagas', roles: ['admin', 'manager'], group: 'recursos' },
        { path: '/knowledge-base', icon: BookOpen, label: 'Procedimentos', roles: ['admin', 'tecnico', 'cliente', 'manager'], group: 'recursos' },
        { path: '/purchase-requests', icon: ShoppingCart, label: 'Compras', roles: ['admin', 'tecnico'], group: 'recursos' },
        { path: '/fornecedores', icon: Building2, label: 'Fornecedores', roles: ['admin', 'manager'], group: 'recursos' },
        { path: '/notifications', icon: Bell, label: 'Notificações', roles: ['admin', 'tecnico', 'cliente', 'manager'], group: 'recursos' },
        { path: '/users', icon: Users, label: 'Equipe', roles: ['admin'], group: 'recursos' },

        // Grupo Indústria
        { path: '/slaughter/calendar', icon: ClipboardList, label: 'Planejamento de Abate', roles: ['admin', 'tecnico', 'manager'], group: 'industria' },
        { path: '/slaughter/schedule', icon: RefreshCw, label: 'Escala Diária de Abate', roles: ['admin', 'tecnico', 'manager'], group: 'industria' },
        { path: '/slaughter/closure-list', icon: FileText, label: 'Boletins e Fechamentos SIF', roles: ['admin', 'tecnico', 'manager'], group: 'industria' },
    ];

    const filteredMenuItems = menuItems.filter(item =>
        item.roles.includes(user?.role || '')
    );

    const operacoesItems = filteredMenuItems.filter(item => item.group === 'operacoes');
    const recursosItems = filteredMenuItems.filter(item => item.group === 'recursos');
    const industriaItems = filteredMenuItems.filter(item => item.group === 'industria');

    const renderNavItem = (item: MenuItem) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

        return (
            <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={!isOpen ? item.label : ''}
            >
                <Icon size={20} />
                {isOpen && <span>{item.label}</span>}
            </Link>
        );
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                {isOpen && (
                    <div className="sidebar-logo">
                        <h2>CampoFlow</h2>
                    </div>
                )}
                <button className="toggle-btn" onClick={toggleSidebar}>
                    {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            <div className="sidebar-user">
                <div className="user-avatar">
                    <User size={isOpen ? 24 : 20} />
                </div>
                {isOpen && (
                    <div className="user-info">
                        <p className="user-name">{user?.name}</p>
                        <span className="user-role">{user?.role}</span>
                    </div>
                )}
            </div>

            <nav className="sidebar-nav">
                {isOpen && industriaItems.length > 0 && <div className="nav-group-label">Indústria & Abate</div>}
                {industriaItems.map(renderNavItem)}

                {isOpen && <div className="nav-group-label">Operações</div>}
                {operacoesItems.map(renderNavItem)}

                {!isOpen && <div className="nav-group-divider" />}
                {recursosItems.map(renderNavItem)}
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item logout-btn" onClick={logout} title={!isOpen ? 'Sair' : ''}>
                    <LogOut size={20} />
                    {isOpen && <span>Sair</span>}
                </button>
            </div>
        </div>
    );
};
