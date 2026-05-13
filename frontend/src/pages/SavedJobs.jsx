import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bookmark, 
    Search, 
    Filter, 
    Grid, 
    List, 
    Calendar, 
    Briefcase, 
    MapPin, 
    DollarSign, 
    Clock, 
    ExternalLink, 
    Trash2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronDown,
    SortAsc
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SavedJobs = () => {
    const { token } = useAuth();
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'deadline' | 'salary'
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchSavedJobs();
    }, [token]);

    const fetchSavedJobs = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/jobs/saved', config);
            setSavedJobs(data);
        } catch (error) {
            console.error('Failed to fetch saved jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (saveId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const jobToRemove = savedJobs.find(s => s._id === saveId);
            if (!jobToRemove) return;
            
            await axios.post(`http://localhost:5000/api/jobs/${jobToRemove.job._id}/save`, {}, config);
            setSavedJobs(prev => prev.filter(s => s._id !== saveId));
        } catch (error) {
            console.error('Failed to remove job');
        }
    };

    const updateStatus = async (saveId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/jobs/saved/${saveId}`, { status: newStatus }, config);
            setSavedJobs(prev => prev.map(s => s._id === saveId ? { ...s, status: newStatus } : s));
        } catch (error) {
            console.error('Failed to update status');
        }
    };

    const filteredJobs = savedJobs
        .filter(item => {
            const matchesSearch = item.job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 item.job.company.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || item.job.type === filterType;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'deadline') return new Date(a.job.deadline || '9999') - new Date(b.job.deadline || '9999');
            return 0;
        });

    const getDeadlineStatus = (deadline) => {
        if (!deadline) return null;
        const diff = new Date(deadline) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days < 0) return { label: 'Expired', color: 'text-rose-600 bg-rose-50' };
        if (days <= 3) return { label: `Due in ${days}d`, color: 'text-amber-600 bg-amber-50' };
        return { label: `${days} days left`, color: 'text-indigo-600 bg-indigo-50' };
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Bookmark size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Saved Jobs</h1>
                    </div>
                    <p className="text-slate-500 font-medium max-w-md">Track your dream opportunities and manage your application timeline.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search saved jobs..."
                            className="pl-11 pr-4 h-12 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-slate-50 p-1 rounded-2xl">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <Filter size={14} className="text-slate-400" />
                        <select 
                            className="text-xs font-bold text-slate-600 bg-transparent outline-none cursor-pointer"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Internship">Internship</option>
                            <option value="Contract">Contract</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <SortAsc size={14} className="text-slate-400" />
                        <select 
                            className="text-xs font-bold text-slate-600 bg-transparent outline-none cursor-pointer"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Recently Saved</option>
                            <option value="deadline">Upcoming Deadline</option>
                        </select>
                    </div>
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{filteredJobs.length} Opportunities Found</p>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1,2,3].map(i => <div key={i} className="h-80 bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />)}
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                        <Briefcase size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Your wishlist is empty</h3>
                    <p className="text-slate-500 font-medium mt-2 mb-8">Save jobs you like from the portal to track them here.</p>
                    <Link to="/jobs" className="btn-primary px-8 h-12 inline-flex items-center gap-2">
                        Browse Job Portal <ExternalLink size={18} />
                    </Link>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
                    <AnimatePresence mode='popLayout'>
                        {filteredJobs.map((item, idx) => (
                            <motion.div 
                                key={item._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group overflow-hidden ${viewMode === 'list' ? 'flex items-center p-6 gap-8' : ''}`}
                            >
                                {/* Card Header / Image */}
                                {viewMode === 'grid' && (
                                    <div className="h-40 bg-slate-50 relative p-8 flex items-end">
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-lg p-3 relative z-10">
                                            <img 
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.job.company)}&background=fff&color=6366f1&bold=true`} 
                                                className="w-full h-full object-contain" 
                                                alt="Logo" 
                                            />
                                        </div>
                                        <div className="absolute top-6 right-6 flex gap-2">
                                            {item.status === 'applied' && (
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5">
                                                    <CheckCircle2 size={12} /> Applied
                                                </span>
                                            )}
                                            {getDeadlineStatus(item.job.deadline) && (
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${getDeadlineStatus(item.job.deadline).color}`}>
                                                    {getDeadlineStatus(item.job.deadline).label}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {viewMode === 'list' && (
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl p-3 shrink-0">
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.job.company)}&background=f8fafc&color=6366f1&bold=true`} 
                                            className="w-full h-full object-contain" 
                                            alt="Logo" 
                                        />
                                    </div>
                                )}

                                {/* Content */}
                                <div className={`p-8 flex-grow ${viewMode === 'list' ? 'p-0' : ''}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{item.job.title}</h3>
                                            <p className="text-sm text-slate-500 font-bold mt-1">{item.job.company}</p>
                                        </div>
                                        {viewMode === 'list' && (
                                            <div className="flex gap-3">
                                                {item.status === 'applied' ? (
                                                     <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5">
                                                        <CheckCircle2 size={12} /> Applied
                                                    </span>
                                                ) : (
                                                    <button 
                                                        onClick={() => updateStatus(item._id, 'applied')}
                                                        className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest"
                                                    >
                                                        Mark Applied
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className={`grid gap-4 mb-8 ${viewMode === 'list' ? 'grid-cols-4' : 'grid-cols-2'}`}>
                                        <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                                            <MapPin size={14} className="text-slate-300" /> {item.job.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                                            <Briefcase size={14} className="text-slate-300" /> {item.job.type}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                                            <DollarSign size={14} className="text-emerald-500" /> {item.job.salary || 'Competitive'}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                                            <Clock size={14} className="text-slate-300" /> {item.job.deadline ? new Date(item.job.deadline).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <a 
                                            href={item.job.applicationLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            onClick={() => updateStatus(item._id, 'applied')}
                                            className="flex-grow btn-primary py-3 text-xs shadow-indigo-500/10 shadow-lg flex items-center justify-center gap-2"
                                        >
                                            Apply Now <ExternalLink size={14} />
                                        </a>
                                        <button 
                                            onClick={() => handleRemove(item._id)}
                                            className="p-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                                            title="Remove from saved"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default SavedJobs;
