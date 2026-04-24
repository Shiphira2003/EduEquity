import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import {
    LayoutDashboard,
    Users,
    FileText,
    Banknote,
    ClipboardList,
    UserCircle,
    LogOut,
    ChevronLeft,
    Menu,
    Bell,
    Settings,
    GraduationCap,
    Award,
    X,
    BarChart4
} from 'lucide-react';
import logo from '../images/logo.png';

const AdminLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        if (logout) logout();
        navigate('/auth/login');
    };

    const isActive = (path: string) => {
        if (path === '/admin' && location.pathname === '/admin') {
            return 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 font-semibold';
        }
        if (path !== '/admin' && location.pathname.startsWith(path)) {
            return 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 font-semibold';
        }
        return 'text-gray-500 hover:bg-gray-50 hover:text-gray-900';
    };

    const navItems = [
        { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/admin/users', icon: <Users size={20} />, label: 'Users', superOnly: true },
        { to: '/admin/students', icon: <GraduationCap size={20} />, label: 'Students' },
        { to: '/admin/applications', icon: <FileText size={20} />, label: 'Applications' },
        { to: '/admin/ranking', icon: <Award size={20} />, label: 'Ranking Dashboard' },
        { to: '/admin/disbursements', icon: <Banknote size={20} />, label: 'Disbursements' },
        { to: '/admin/fund-sources', icon: <Settings size={20} />, label: 'Fund Cycles' },
        { to: '/admin/audit-logs', icon: <ClipboardList size={20} />, label: 'Audit Logs' },
        { to: '/admin/reports', icon: <BarChart4 size={20} />, label: 'Financial Reports' },
        { to: '/admin/announcements', icon: <Bell size={20} />, label: 'Announcements' },
        { to: '/admin/profile', icon: <UserCircle size={20} />, label: 'My Profile' },
    ].filter(item => !item.superOnly || user?.role === 'SUPER_ADMIN');

    // Get current page title
    const currentPage = navItems.find(item =>
        item.to === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.to)
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* ─── TOP NAVBAR ─────────────────────────────────────── */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center px-4 gap-4 shadow-sm">
                {/* Mobile menu toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                >
                    {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                {/* Desktop sidebar toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition"
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>

                {/* Brand */}
                <Link to="/admin" className="flex items-center gap-2 shrink-0 group">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 group-hover:shadow-md transition-all overflow-hidden p-0.5">
                        <img src={logo} alt="BH" className="w-full h-full object-contain" />
                    </div>
                    <span className="hidden sm:block font-bold text-primary text-base">BursarHub</span>
                    <span className="hidden sm:block text-[10px] font-bold tracking-wider text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 rounded-md ml-1 uppercase">Admin</span>
                    {user?.systemId && (
                        <span className="hidden md:block text-[10px] font-bold tracking-wider text-green-700 border border-green-200 bg-green-50 px-2 py-0.5 rounded-md ml-1 uppercase">
                            {user.systemId}
                        </span>
                    )}
                </Link>

                {/* Breadcrumb/page title */}
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-400 ml-2">
                    <span>/</span>
                    <span className="text-gray-700 font-medium">{currentPage?.label || 'Admin'}</span>
                </div>

                <div className="flex-1" />

                {/* Right: notification bell + user */}
                <Header
                    user={{ name: user?.email || 'Admin' }}
                    onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    inline
                />
            </header>

            {/* ─── BODY (sidebar + content) ─────────────────────── */}
            <div className="flex flex-1 pt-16">
                {/* Mobile overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* ─── SIDEBAR ────────────────────────── */}
                <aside
                    className={`
                        fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)]
                        bg-white border-r border-gray-200
                        flex flex-col
                        transform transition-all duration-300 ease-in-out
                        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                        ${isCollapsed ? 'md:w-[70px]' : 'md:w-64'}
                        w-64
                    `}
                >
                    {/* Nav Links */}
                    <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
                        <nav className="px-2 space-y-0.5">
                            {navItems.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                                        group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all gap-3
                                        ${isActive(link.to)}
                                        ${isCollapsed ? 'justify-center' : ''}
                                    `}
                                    title={isCollapsed ? link.label : ''}
                                >
                                    <span className="shrink-0">{link.icon}</span>
                                    {!isCollapsed && (
                                        <span className="whitespace-nowrap">{link.label}</span>
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Sign Out */}
                    <div className="p-3 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-500 rounded-lg hover:bg-zinc-50 hover:text-black transition-all ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? 'Sign Out' : ''}
                        >
                            <LogOut size={20} className="shrink-0" />
                            {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
                        </button>
                    </div>
                </aside>

                {/* ─── MAIN CONTENT ───────────────────── */}
                <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
                    <div className="flex-1 p-4 sm:p-8">
                        <div className="max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
