import React, { useState } from 'react';
import { Bell, X, Briefcase, Calendar, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useNotification from '../hooks/useNotification';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, setNotifications } = useNotification();
    const { user } = useAuth();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/notifications/${id}`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark notification as read');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'job': return <Briefcase className="w-4 h-4 text-blue-600" />;
            case 'event': return <Calendar className="w-4 h-4 text-purple-600" />;
            default: return <Info className="w-4 h-4 text-slate-600" />;
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all relative"
            >
                <Bell className="w-6 h-6 text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsOpen(false)} 
                        />
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-bold text-slate-900">Notifications</h3>
                                <button onClick={() => setIsOpen(false)}>
                                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                                </button>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <p className="text-sm text-slate-500">No notifications yet.</p>
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div 
                                            key={n._id || Math.random()} 
                                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer flex gap-4 ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                                            onClick={() => !n.isRead && markAsRead(n._id)}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-grow">
                                                <p className={`text-sm mb-1 ${!n.isRead ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {!n.isRead && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
