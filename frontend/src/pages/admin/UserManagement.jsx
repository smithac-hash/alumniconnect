import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Search, 
    Filter, 
    MoreVertical, 
    Trash2, 
    ShieldCheck, 
    Key, 
    Mail, 
    Download,
    ChevronLeft,
    ChevronRight,
    UserX
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const UserManagement = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get('search') || '';

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [activeTab, setActiveTab] = useState('all'); // all, student, alumni
    const { user: currentUser } = useAuth();

    useEffect(() => {
        setSearchTerm(initialSearch);
    }, [initialSearch]);

    useEffect(() => {
        fetchUsers();
    }, [currentUser.token]);

    const fetchUsers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/admin/users', config);
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            await axios.delete(`http://localhost:5000/api/admin/reject/${id}`, config);
            setUsers(prev => prev.filter(u => u._id !== id));
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const handleResetPassword = async (id) => {
        const newPassword = window.prompt('Enter new password for this user:');
        if (!newPassword) return;
        try {
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            await axios.put(`http://localhost:5000/api/admin/users/${id}/reset-password`, { newPassword }, config);
            alert('Password reset successfully');
        } catch (error) {
            alert('Failed to reset password');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || u.role === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h2>
                    <p className="text-slate-500 font-medium">Manage students, alumni, and their access.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary px-4 h-10 flex items-center gap-2 text-sm">
                        <Download size={16} /> Export CSV
                    </button>
                    <button className="btn-primary px-4 h-10 flex items-center gap-2 text-sm shadow-indigo-500/20 shadow-lg">
                         Add New User
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                        {['all', 'student', 'alumni'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider
                                    ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search name or email..." 
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role / Dept</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Join Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4 h-16 bg-slate-50/50" />
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-medium">
                                        No users match your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{u.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                                    ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 
                                                      u.role === 'alumni' ? 'bg-indigo-50 text-indigo-600' : 
                                                      'bg-blue-50 text-blue-600'}`}
                                                >
                                                    {u.role}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{u.department || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.isVerified ? (
                                                <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase">
                                                    <ShieldCheck size={12} /> Verified
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-amber-500 text-[10px] font-bold uppercase">
                                                    <UserX size={12} /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => handleResetPassword(u._id)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Reset Password"
                                                >
                                                    <Key size={14} />
                                                </button>
                                                <button 
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Send Email"
                                                >
                                                    <Mail size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(u._id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-medium">Showing {filteredUsers.length} of {users.length} users</p>
                    <div className="flex items-center gap-2">
                        <button className="p-1 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
                            <ChevronLeft size={16} />
                        </button>
                        <button className="p-1 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
