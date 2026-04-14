import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, ArrowLeft } from 'lucide-react';
import { AvatarDisplay } from './AvatarSelector';
import logo from '../images/logo.png';

export const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const navLinkClass = (path: string) => {
        return `text-sm font-medium transition-colors ${isActive(path)
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-primary'
            }`;
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        {location.pathname !== '/' && (
                            <button
                                onClick={() => navigate(-1)}
                                className="mr-4 p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                                title="Go Back"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 overflow-hidden">
                                <img src={logo} alt="BursarHub Logo" className="w-full h-full object-contain p-1" />
                            </div>
                            <span className="font-bold text-xl text-primary tracking-tight hidden sm:inline group-hover:text-primary-dark transition-colors">
                                BursarHub
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className={navLinkClass('/')}>
                            Home
                        </Link>
                        <Link to="/about" className={navLinkClass('/about')}>
                            About
                        </Link>
                        <Link to="/public-ledger" className={navLinkClass('/public-ledger')}>
                            Public Ledger
                        </Link>

                        {!user ? (
                            <>
                                <Link to="/auth/login" className={navLinkClass('/auth/login')}>
                                    Login
                                </Link>
                                <Link
                                    to="/register-student"
                                    className="bg-action hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                                >
                                    Apply / Register
                                </Link>
                            </>
                        ) : (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? (
                            <>
                                <Link to="/admin" className={navLinkClass('/admin')}>
                                    Admin Dashboard
                                </Link>
                                <div className="flex items-center gap-3 pl-4 border-l border-zinc-100">
                                    <AvatarDisplay id={user.avatar || 'av1'} className="w-8 h-8 rounded-lg" />
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-500 hover:text-black transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut size={16} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/student/apply"
                                    className="bg-action hover:bg-action-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                                >
                                    Apply
                                </Link>
                                <Link to="/student/dashboard" className={navLinkClass('/student/dashboard')}>
                                    Dashboard
                                </Link>
                                <Link to="/student/applications" className={navLinkClass('/student/applications')}>
                                    My Applications
                                </Link>
                                <Link to="/student/profile" className={navLinkClass('/student/profile')}>
                                    Profile
                                </Link>
                                <div className="flex items-center gap-3 pl-4 border-l border-zinc-100">
                                    <AvatarDisplay id={user.avatar || 'av1'} className="w-8 h-8 rounded-lg" />
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-500 hover:text-black transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-gray-600 hover:text-primary transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4 space-y-1">
                        <Link
                            to="/"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            to="/about"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                        >
                            About
                        </Link>
                        <Link
                            to="/public-ledger"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                        >
                            Public Ledger
                        </Link>

                        {!user ? (
                            <>
                                <Link
                                    to="/auth/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register-student"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium bg-action text-white hover:bg-action-hover transition-colors"
                                >
                                    Apply / Register
                                </Link>
                            </>
                        ) : (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? (
                            <div className="px-3 py-4 space-y-3">
                                <div className="flex items-center gap-3 px-3 py-2 bg-zinc-50 rounded-xl">
                                    <AvatarDisplay id={user.avatar || 'av1'} className="w-10 h-10 rounded-lg" />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-bold text-zinc-900 truncate">{user.fullName || 'Admin'}</p>
                                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <Link
                                    to="/admin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                                >
                                    Admin Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="px-3 py-4 space-y-3">
                                <div className="flex items-center gap-3 px-3 py-2 bg-zinc-50 rounded-xl mb-2">
                                    <AvatarDisplay id={user.avatar || 'av1'} className="w-10 h-10 rounded-lg" />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-bold text-zinc-900 truncate">{user.fullName || 'Student'}</p>
                                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <Link
                                    to="/student/apply"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-3 rounded-xl text-base font-bold bg-primary text-white hover:opacity-90 transition-colors text-center shadow-lg shadow-primary/20"
                                >
                                    Apply for Bursary
                                </Link>
                                <Link
                                    to="/student/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/student/applications"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                                >
                                    My Applications
                                </Link>
                                <Link
                                    to="/student/profile"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                                >
                                    Profile Settings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Logout System
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
