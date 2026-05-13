import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user, loading } = useAuth();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const location = useLocation();

    // Redirect if not admin
    if (!loading && (!user || user.role !== 'admin')) {
        return <Navigate to="/login" />;
    }

    if (loading) return null;

    // Default route for /admin
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
        return <Navigate to="/admin/overview" />;
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <AdminSidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileSidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
                        />
                        <motion.div 
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-64 z-40 lg:hidden"
                        >
                            <AdminSidebar />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <AdminNavbar toggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />
                
                <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                <footer className="px-10 py-6 border-t border-slate-200 bg-white/50 backdrop-blur-md">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
                        <p className="text-sm text-slate-500 font-medium">
                            &copy; {new Date().getFullYear()} AlumniConnect Admin Portal. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Support</a>
                            <a href="#" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Privacy</a>
                            <a href="#" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Terms</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AdminDashboard;


