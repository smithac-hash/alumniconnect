import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Clock, Plus, ExternalLink, X, Search, Bookmark, BookmarkCheck } from 'lucide-react';
import io from 'socket.io-client';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const JobPortal = () => {
    const { user, token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [savedJobIds, setSavedJobIds] = useState(new Set());
    
    // Form state for posting new job
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        description: '',
        applicationLink: '',
        salary: '',
        domain: '',
        deadline: '',
        skillsRequired: ''
    });

    const handlePostJob = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const postData = {
                ...formData,
                skillsRequired: formData.skillsRequired.split(',').map(s => s.trim()).filter(s => s !== '')
            };
            await axios.post('http://localhost:5000/api/jobs', postData, config);
            setShowModal(false);
            fetchJobs();
        } catch (error) {
            alert('Failed to post job');
        }
    };
    const [search, setSearch] = useState('');
    const [filterDomain, setFilterDomain] = useState('');
    const [filterType, setFilterType] = useState('');

    useEffect(() => {
        fetchJobs();
        if (user?.role === 'student') fetchSavedJobs();
        
        const socket = io('http://localhost:5000');
        socket.on('new_job', () => fetchJobs());
        return () => socket.close();
    }, [filterDomain, filterType, token]);

    const fetchSavedJobs = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/jobs/saved', config);
            setSavedJobIds(new Set(data.map(item => item.job._id)));
        } catch (error) {
            console.error('Failed to fetch saved jobs');
        }
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const { data } = await axios.get(`http://localhost:5000/api/jobs?search=${search}&domain=${filterDomain}&type=${filterType}`, token ? config : {});
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    };

    const toggleBookmark = async (jobId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`http://localhost:5000/api/jobs/${jobId}/save`, {}, config);
            
            setSavedJobIds(prev => {
                const next = new Set(prev);
                if (data.isSaved) next.add(jobId);
                else next.delete(jobId);
                return next;
            });
        } catch (error) {
            console.error('Failed to toggle bookmark');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Job Portal</h1>
                    <p className="text-slate-500">Opportunities shared by our alumni network</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-grow max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Search jobs..."
                            className="input-field pl-12 h-12"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                        />
                    </div>
                    
                    <select 
                        className="input-field w-auto h-12 bg-white"
                        value={filterDomain}
                        onChange={(e) => setFilterDomain(e.target.value)}
                    >
                        <option value="">All Domains</option>
                        <option>Software Engineering</option>
                        <option>Data Science</option>
                        <option>Product Management</option>
                        <option>Cybersecurity</option>
                    </select>

                    {user?.role === 'alumni' && (
                        <button 
                            onClick={() => setShowModal(true)}
                            className="btn-primary flex items-center gap-2 h-12"
                        >
                            <Plus className="w-5 h-5" />
                            Post a Job
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse shadow-sm" />)
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 glass-card">
                        <p className="text-slate-500">No jobs posted yet.</p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <motion.div 
                            key={job._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                        >
                            <div className="flex-grow">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{job.title}</h2>
                                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase">
                                            {job.type}
                                        </span>
                                    </div>
                                    {user?.role === 'student' && (
                                        <button 
                                            onClick={() => toggleBookmark(job._id)}
                                            className={`p-2 rounded-xl transition-all ${savedJobIds.has(job._id) ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                                        >
                                            {savedJobIds.has(job._id) ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                                        </button>
                                    )}
                                </div>
                                <p className="text-slate-600 font-semibold mb-4">{job.company}</p>
                                
                                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Briefcase className="w-4 h-4" />
                                        {job.domain}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {job.deadline ? `Deadline: ${new Date(job.deadline).toLocaleDateString()}` : 'No Deadline'}
                                    </div>
                                    {job.salary && (
                                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                                            <DollarSign className="w-4 h-4 text-emerald-600" />
                                            {job.salary}
                                        </div>
                                    )}
                                </div>

                                {job.skillsRequired && job.skillsRequired.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {job.skillsRequired.map((skill, idx) => (
                                            <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                
                                {job.postedBy && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4">
                                        <Link to={`/alumni/${job.postedBy._id}`}>
                                            <img 
                                                src={job.alumniProfile?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.postedBy.name)}&background=2563eb&color=fff`} 
                                                alt={job.postedBy.name}
                                                className="w-10 h-10 rounded-full border-2 border-transparent hover:border-blue-600 transition-colors object-cover"
                                            />
                                        </Link>
                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Posted by: <Link to={`/alumni/${job.postedBy._id}`} className="font-bold text-slate-900 hover:text-blue-600">{job.postedBy.name}</Link>
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {job.alumniProfile?.role || 'Alumni'} {job.alumniProfile?.company ? `at ${job.alumniProfile.company}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <a 
                                href={job.applicationLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn-secondary flex items-center gap-2 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all"
                            >
                                Apply Now
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Post Job Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-slate-900">Post New Opportunity</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handlePostJob} className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Job Title</label>
                                    <input 
                                        required
                                        className="input-field"
                                        placeholder="e.g. Senior Software Engineer"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Company</label>
                                    <input 
                                        required
                                        className="input-field"
                                        placeholder="Google"
                                        value={formData.company}
                                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Location</label>
                                    <input 
                                        required
                                        className="input-field"
                                        placeholder="Bangalore, Hybrid"
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Job Type</label>
                                    <select 
                                        className="input-field bg-white"
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    >
                                        <option>Full-time</option>
                                        <option>Internship</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Domain</label>
                                    <select 
                                        className="input-field bg-white"
                                        value={formData.domain}
                                        onChange={(e) => setFormData({...formData, domain: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Domain</option>
                                        <option>Software Engineering</option>
                                        <option>Data Science</option>
                                        <option>Product Management</option>
                                        <option>Cybersecurity</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Estimated Salary / Stipend</label>
                                    <input 
                                        className="input-field"
                                        placeholder="e.g. 15-20 LPA"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({...formData, salary: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Deadline</label>
                                    <input 
                                        type="date"
                                        className="input-field"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Skills Required (comma separated)</label>
                                    <input 
                                        className="input-field"
                                        placeholder="React, Node.js, AWS"
                                        value={formData.skillsRequired}
                                        onChange={(e) => setFormData({...formData, skillsRequired: e.target.value})}
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Application Link / Email</label>
                                    <input 
                                        required
                                        className="input-field"
                                        placeholder="https://careers.google.com/..."
                                        value={formData.applicationLink}
                                        onChange={(e) => setFormData({...formData, applicationLink: e.target.value})}
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Short Description</label>
                                    <textarea 
                                        required
                                        className="input-field min-h-[120px] pt-3"
                                        placeholder="Briefly describe the role and key requirements..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                                <button type="submit" className="col-span-2 btn-primary h-14 mt-4">
                                    Publish Job Listing
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JobPortal;
