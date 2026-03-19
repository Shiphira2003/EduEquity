import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, ArrowLeft } from 'lucide-react';

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
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                <span className="text-white font-bold text-sm">E E</span>
                            </div>
                            <span className="font-bold text-xl text-primary tracking-tight hidden sm:inline">
                                EduEquity
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

                        {!user ? (
                            <>
                                <Link to="/auth/login" className={navLinkClass('/auth/login')}>
                                    Login
                                </Link>
                                <Link
                                    to="/register-student"
                                    className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                                >
                                    Register
                                </Link>
                            </>
                        ) : user.role === 'ADMIN' ? (
                            <>
                                <Link to="/admin" className={navLinkClass('/admin')}>
                                    Admin Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/student/dashboard" className={navLinkClass('/student/dashboard')}>
                                    Dashboard
                                </Link>
                                <Link to="/student/applications" className={navLinkClass('/student/applications')}>
                                    My Applications
                                </Link>
                                <Link to="/student/profile" className={navLinkClass('/student/profile')}>
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
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
                                    className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white hover:bg-primary-light transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        ) : user.role === 'ADMIN' ? (
                            <>
                                <Link
                                    to="/admin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                                >
                                    Admin Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/student/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/student/applications"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                                >
                                    My Applications
                                </Link>
                                <Link
                                    to="/student/profile"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
