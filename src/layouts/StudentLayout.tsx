import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    User,
    LogOut,
    ChevronLeft,
    Menu
} from 'lucide-react';

const StudentLayout: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Mock logout function
    const handleLogout = () => {
        // Clear tokens/state here
        navigate('/auth/login');
    };

    const isActive = (path: string) => {
        return location.pathname === path
            ? 'bg-primary/10 text-primary border-r-4 border-primary'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900';
    };

    const navItems = [
        { to: '/student/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/student/applications', icon: <FileText size={20} />, label: 'My Applications' },
        { to: '/student/apply', icon: <PlusCircle size={20} />, label: 'New Application' },
        { to: '/student/profile', icon: <User size={20} />, label: 'My Profile' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:static inset-y-0 left-0 z-50
                    bg-white border-r border-gray-200 
                    transform transition-transform duration-300 ease-in-out
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${isCollapsed ? 'w-20' : 'w-64'}
                    flex flex-col h-full
                `}
            >
                <div className="h-16 flex items-center px-4 border-b border-gray-100 bg-white relative">
                    <Link to="/" className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                        <div className="w-8 h-8 bg-primary rounded-lg flex-shrink-0 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-xs">E E</span>
                        </div>
                        {!isCollapsed && <span className="font-bold text-lg text-gray-900 whitespace-nowrap">EduEquity</span>}
                    </Link>

                    {/* Desktop Toggle Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full w-6 h-6 hidden md:flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-50 text-gray-400 hover:text-primary"
                    >
                        <ChevronLeft className={`w-3 h-3 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 overflow-x-hidden">
                    <nav className="px-3 space-y-1">
                        {navItems.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all 
                                    ${isActive(link.to)} 
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                                title={isCollapsed ? link.label : ''}
                            >
                                <span className={`${isCollapsed ? 'mr-0' : 'mr-3'} transition-colors`}>{link.icon}</span>
                                {!isCollapsed && (
                                    <span className="whitespace-nowrap transition-opacity duration-300">
                                        {link.label}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-100 bg-white">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? 'Sign Out' : ''}
                    >
                        <LogOut size={20} className={`${isCollapsed ? 'mr-0' : 'mr-3'}`} />
                        {!isCollapsed && <span className="whitespace-nowrap transition-opacity duration-300">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out">
                {/* Mobile Header Trigger */}
                <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-xs">E E</span>
                        </div>
                        <span className="font-bold text-lg text-gray-900">EduEquity</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600">
                        <Menu size={24} />
                    </button>
                </div>

                <Header
                    user={{ name: user?.email || "Student" }}
                    onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="hidden md:block"
                />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default StudentLayout;
