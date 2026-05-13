import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Filter, 
    CheckCircle, 
    XCircle, 
    Info, 
    ExternalLink,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AlumniVerification = () => {
    const [pendingAlumni, setPendingAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAlum, setSelectedAlum] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchPendingAlumni();
    }, [user.token]);

    const fetchPendingAlumni = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/admin/unverified', config);
            setPendingAlumni(data);
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
            setPendingAlumni(prev => prev.filter(a => a._id !== id));
            setSelectedAlum(null);
        } catch (error) {
            alert('Failed to verify user');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this application? This will permanently delete the account.')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/admin/reject/${id}`, config);
            setPendingAlumni(prev => prev.filter(a => a._id !== id));
            setSelectedAlum(null);
        } catch (error) {
            alert('Failed to reject user');
        }
    };

    const filteredAlumni = pendingAlumni.filter(alum => 
        alum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alum.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Alumni Verification</h2>
                    <p className="text-slate-500 font-medium">Review and approve new alumni registrations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search pending..." 
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Applied Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="px-6 py-8 h-24 bg-slate-50/30" />
                                    </tr>
                                ))
                            ) : filteredAlumni.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-medium">
                                        No pending verifications found.
                                    </td>
                                </tr>
                            ) : (
                                filteredAlumni.map((alum) => (
                                    <tr key={alum._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                                    {alum.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-none mb-1">{alum.name}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{alum.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">{alum.profile?.role || 'N/A'}</p>
                                                <p className="text-xs text-slate-500">{alum.profile?.company || 'No Company'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                                            {new Date(alum.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => setSelectedAlum(alum)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Info size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleVerify(alum._id)}
                                                    className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(alum._id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Reject"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Profile Detail Modal */}
            <AnimatePresence>
                {selectedAlum && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedAlum(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10"
                        >
                            <div className="h-32 bg-indigo-600"></div>
                            <div className="px-8 pb-8">
                                <div className="relative -mt-12 mb-6">
                                    <div className="w-24 h-24 rounded-2xl border-4 border-white bg-indigo-50 flex items-center justify-center text-indigo-600 text-3xl font-black shadow-lg">
                                        {selectedAlum.name.charAt(0)}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-1">{selectedAlum.name}</h3>
                                        <p className="text-indigo-600 font-bold mb-6 flex items-center gap-2">
                                            <Briefcase size={16} />
                                            {selectedAlum.profile?.role} @ {selectedAlum.profile?.company}
                                        </p>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <Mail size={18} className="text-slate-400" />
                                                <span className="text-sm font-medium">{selectedAlum.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <Calendar size={18} className="text-slate-400" />
                                                <span className="text-sm font-medium">Batch of {selectedAlum.profile?.graduationYear}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <Info size={18} className="text-slate-400" />
                                                <span className="text-sm font-medium">USN: {selectedAlum.profile?.usn || 'BE123456'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Verification Documents</h4>
                                        <div className="space-y-3">
                                            <a href={selectedAlum.profile?.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-sm font-bold text-indigo-600 hover:border-indigo-200 transition-all">
                                                LinkedIn Profile <ExternalLink size={14} />
                                            </a>
                                            <div className="p-3 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-600">
                                                Degree Certificate <span className="float-right text-[10px] text-slate-400">PDF</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-slate-200 flex gap-3">
                                            <button 
                                                onClick={() => handleVerify(selectedAlum._id)}
                                                className="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                                            >
                                                Verify
                                            </button>
                                            <button 
                                                onClick={() => handleReject(selectedAlum._id)}
                                                className="flex-1 bg-rose-500 text-white py-2 rounded-xl font-bold text-sm shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedAlum(null)}
                                className="absolute top-4 right-4 p-2 bg-black/20 text-white hover:bg-black/40 rounded-full transition-all"
                            >
                                <XCircle size={20} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AlumniVerification;
