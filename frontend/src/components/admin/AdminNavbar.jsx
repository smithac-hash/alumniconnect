import React, { useState } from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminNavbar = ({ toggleMobileSidebar }) => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/admin/users?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
                <button 
                    onClick={toggleMobileSidebar}
                    className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                    <Menu size={20} />
                </button>
                
                <form onSubmit={handleSearch} className="relative max-w-md w-full hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for users, jobs, or announcements..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </form>
            </div>

            <div className="flex items-center gap-3">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
                
                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 leading-none">{user?.name || 'Admin User'}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">System Administrator</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminNavbar;
