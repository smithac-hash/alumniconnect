import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    UserCheck, 
    Users, 
    Briefcase, 
    Calendar, 
    MessageSquare, 
    Bell, 
    BarChart3, 
    Settings,
    LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
    const { logout } = useAuth();

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/admin/overview' },
        { icon: <BarChart3 size={20} />, label: 'Alumni Intelligence', path: '/admin/analytics' },
        { icon: <UserCheck size={20} />, label: 'Verification', path: '/admin/verification' },
        { icon: <Users size={20} />, label: 'User Management', path: '/admin/users' },
        { icon: <Briefcase size={20} />, label: 'Job Moderation', path: '/admin/jobs' },
        { icon: <Calendar size={20} />, label: 'Announce Meet', path: '/admin/announcements' },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col border-r border-slate-800 shadow-xl z-20">
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <LayoutDashboard size={24} />
                </div>
                <div>
                    <h1 className="text-white font-bold text-lg tracking-tight leading-none">AdminHub</h1>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">College Portal</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                            ${isActive 
                                ? 'bg-indigo-600/10 text-indigo-400 font-semibold' 
                                : 'hover:bg-slate-800 hover:text-white'}
                        `}
                    >
                        <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                        <span className="text-sm">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <NavLink
                    to="/admin/settings"
                    className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1
                        ${isActive ? 'bg-indigo-600/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}
                    `}
                >
                    <Settings size={20} />
                    <span className="text-sm">Settings</span>
                </NavLink>
                <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                    <LogOut size={20} />
                    <span className="text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
