import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Bell, CheckCircle, Info } from 'lucide-react';

interface HeaderProps {
    user?: {
        name: string;
        imageUrl?: string;
    };
    onMenuClick?: () => void;
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({ user: defaultUser, onMenuClick, className = '' }) => {
    const location = useLocation();
    const { user } = useAuth();

    // Notifications State
    const [showNotifications, setShowNotifications] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;
        const fetchItems = async () => {
            try {
                if (user.role === 'ADMIN') {
                    const res = await api.get('/notifications');
                    setItems(res.data);
                } else if (user.role === 'STUDENT') {
                    const res = await api.get('/announcements');
                    setItems(res.data);
                }
            } catch (err) {
                console.error('Failed to fetch notification items', err);
            }
        };
        fetchItems();
    }, [user, showNotifications]); // re-fetch when opened too

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: number) => {
        if (user?.role !== 'ADMIN') return; // announcements don't have read status
        try {
            await api.patch(`/notifications/${id}/read`);
            setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const getPageTitle = (pathname: string) => {
        if (pathname.startsWith('/admin')) {
            if (pathname.includes('/audit-logs')) return 'Application Audit Trail';
            if (pathname.includes('/announcements')) return 'Announcements Publishing';
            return 'Admin Portal';
        }

        switch (pathname) {
            case '/student/dashboard': return 'Student Dashboard';
            case '/student/applications': return 'My Applications';
            case '/student/apply': return 'New Application';
            case '/student/profile': return 'My Profile';
            default: return pathname.startsWith('/student') ? 'Student Portal' : 'EduEquity';
        }
    };

    const unreadCount = user?.role === 'ADMIN'
        ? items.filter(n => !n.is_read).length
        : items.length; // Students just see total announcements count as badge for now

    return (
        <header className={`bg-blue-600 text-white border-b border-blue-700/90 sticky top-0 z-30 shadow-md ${className}`}>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            type="button"
                            className="text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white p-2 rounded-md"
                            onClick={onMenuClick}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Page Title */}
                    <div className="flex-1 flex justify-center md:justify-start">
                        <h1 className="text-xl font-semibold text-white tracking-wide">
                            {getPageTitle(location.pathname)}
                        </h1>
                    </div>

                    {/* Right section: Notifications & Profile */}
                    <div className="flex items-center space-x-4 relative">
                        <div ref={notifRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 bg-blue-500/30 text-white/90 hover:text-white rounded-full hover:bg-blue-500/50 transition-colors relative"
                            >
                                <span className="sr-only">View notifications</span>
                                <Bell className="h-6 w-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden transform transition-all z-50">
                                    <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-800">
                                            {user?.role === 'ADMIN' ? 'System Notifications' : 'Announcements'}
                                        </h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {items.length > 0 ? (
                                            items.map((item, idx) => (
                                                <div
                                                    key={item.id}
                                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${user?.role === 'ADMIN' && !item.is_read ? 'bg-blue-50/30' : ''}`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className="flex-shrink-0 mt-1">
                                                            {user?.role === 'ADMIN' ? (
                                                                <Info className="w-5 h-5 text-blue-500" />
                                                            ) : (
                                                                <span className="text-xl">📢</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            {user?.role !== 'ADMIN' && <p className="text-sm font-semibold text-gray-900">{item.title}</p>}
                                                            <p className="text-sm text-gray-700">{item.message}</p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {new Date(item.created_at).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        {user?.role === 'ADMIN' && !item.is_read && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(item.id)}
                                                                className="flex-shrink-0 text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                                                                title="Mark as read"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-6 text-center text-gray-500">
                                                No new {user?.role === 'ADMIN' ? 'notifications' : 'announcements'}.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="hidden md:flex items-center space-x-3 border-l border-white/20 pl-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-white">{user?.email || defaultUser?.name || 'User'}</p>
                                <p className="text-xs text-blue-200 capitalize">{user?.role?.toLowerCase()}</p>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold border-2 border-white/20 shadow-sm uppercase">
                                {(user?.email || defaultUser?.name || 'S').charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
