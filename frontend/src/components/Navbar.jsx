import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold gradient-text">
                    AlumniConnect
                </Link>

                <div className="flex items-center gap-6">

                    <Link to="/jobs" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                        Jobs
                    </Link>
                    <Link to="/events" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                        Events
                    </Link>

                    {user && user.token ? (
                        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                            <NotificationBell />
                            <Link to={`/${user.role}-dashboard`} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                                <LayoutDashboard className="w-5 h-5" />
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="btn-secondary px-4 py-2">
                                Login
                            </Link>
                            <Link to="/signup" className="btn-primary px-4 py-2">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
