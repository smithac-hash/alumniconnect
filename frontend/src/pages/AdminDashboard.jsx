import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Shield, AlertTriangle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const [pendingAlumni, setPendingAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    
    const [stats, setStats] = useState([
        { label: 'Total Users', value: '...', icon: <Users />, color: 'bg-blue-50 text-blue-600' },
        { label: 'Unverified Alumni', value: '...', icon: <Shield />, color: 'bg-amber-50 text-amber-600' },
        { label: 'Flagged Content', value: '0', icon: <AlertTriangle />, color: 'bg-red-50 text-red-600' },
    ]);

    useEffect(() => {
        fetchPendingAlumni();
    }, []);

    const fetchPendingAlumni = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/admin/unverified', config);
            setPendingAlumni(data);
            
            // Update stats
            setStats(prev => [
                { ...prev[0], value: '1,284' }, // Static for now
                { ...prev[1], value: data.length.toString() },
                prev[2]
            ]);
        } catch (error) {
            console.error('Failed to fetch pending alumni');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/admin/verify/${id}`, {}, config);
            fetchPendingAlumni();
        } catch (error) {
            alert('Failed to verify user');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject and delete this user?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/admin/reject/${id}`, config);
            fetchPendingAlumni();
        } catch (error) {
            alert('Failed to reject user');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <header className="mb-12">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Control Center</h1>
                <p className="text-slate-500">Oversee the AlumniConnect network & verify new accounts.</p>
            </header>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-card p-8 flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm font-bold mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}>
                            {React.cloneElement(stat.icon, { className: 'w-7 h-7' })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <section className="glass-card overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Alumni Verification Queue</h2>
                            <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-black rounded-full uppercase">
                                {pendingAlumni.length} Pending
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-8 py-4">User</th>
                                        <th className="px-8 py-4">Domain / Company</th>
                                        <th className="px-8 py-4">Grad Year</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        [1,2].map(i => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan="4" className="px-8 py-6 h-20 bg-slate-50/50" />
                                            </tr>
                                        ))
                                    ) : pendingAlumni.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-12 text-center text-slate-500">
                                                No pending verifications at the moment.
                                            </td>
                                        </tr>
                                    ) : (
                                        pendingAlumni.map((alum) => (
                                            <tr key={alum._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div>
                                                        <p className="font-bold text-slate-900">{alum.name}</p>
                                                        <p className="text-xs text-slate-500">{alum.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-sm text-slate-600">
                                                        {alum.profile?.role} @ {alum.profile?.company || 'N/A'}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-bold text-slate-900">{alum.profile?.graduationYear || 'N/A'}</p>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleVerify(alum._id)}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReject(alum._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    <section className="glass-card p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Security Logs</h2>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                                    <div>
                                        <p className="text-slate-900 font-bold mb-1">System Update</p>
                                        <p className="text-slate-500 mb-2">Automated backup completed successfully for database.</p>
                                        <p className="text-slate-400 font-medium italic">{i*2} hours ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    <button className="w-full btn-secondary h-14 flex items-center justify-center gap-3">
                        <Search className="w-5 h-5" />
                        Search Audit Logs
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

