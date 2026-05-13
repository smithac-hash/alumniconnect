import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Briefcase, 
    Calendar, 
    Search, 
    CheckCircle, 
    XCircle, 
    Eye, 
    Trash2,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ContentModeration = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('http://localhost:5000/api/jobs', config);
                setJobs(data);
            } catch (error) {
                console.error('Failed to fetch content');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.token]);

    const handleDeleteJob = async (id) => {
        if (!window.confirm('Remove this job post?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/jobs/${id}`, config);
            setJobs(prev => prev.filter(j => j._id !== id));
        } catch (error) {
            alert('Failed to delete job');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Content Moderation</h2>
                    <p className="text-slate-500 font-medium">Review job postings and platform content.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map(job => (
                    <div key={job._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
                                {job.company?.charAt(0)}
                            </div>
                            {!job.isVerified && (
                                <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg uppercase flex items-center gap-1">
                                    <AlertCircle size={12} /> Pending Approval
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                        <p className="text-sm text-slate-500 font-medium mb-4">{job.company} • {job.location}</p>
                        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                            <button className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 flex items-center justify-center gap-2">
                                <Eye size={14} /> View
                            </button>
                            <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Verify Job">
                                <CheckCircle size={18} />
                            </button>
                            <button 
                                onClick={() => handleDeleteJob(job._id)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" 
                                title="Delete Job"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {jobs.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-100 italic">
                        No job posts found for moderation.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentModeration;
