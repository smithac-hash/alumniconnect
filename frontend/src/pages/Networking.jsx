import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Users, 
    UserPlus, 
    Check, 
    X, 
    Search, 
    Filter,
    MapPin,
    Briefcase,
    MessageSquare,
    GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Networking = () => {
    const { user, token } = useAuth();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [suggestedAlumni, setSuggestedAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [pendingRes, alumniRes] = await Promise.all([
                axios.get('http://localhost:5000/api/connections/pending', config),
                axios.get('http://localhost:5000/api/alumni', config)
            ]);
            setPendingRequests(pendingRes.data);
            // Filter out self and already connected
            setSuggestedAlumni(alumniRes.data.filter(p => p.user._id !== user._id));
        } catch (error) {
            console.error('Failed to fetch networking data');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/connections/${requestId}`, { status }, config);
            setPendingRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (error) {
            console.error('Action failed');
        }
    };

    const sendRequest = async (receiverId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/connections/request', { receiverId }, config);
            alert('Connection request sent!');
        } catch (error) {
            alert('Request failed');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Networking Hub</h1>
                    <p className="text-slate-500 font-medium mt-2">Expand your professional circle and find mentors.</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
                    <button className="px-6 py-2 bg-white text-indigo-600 font-bold text-sm rounded-xl shadow-sm">Discover</button>
                    <button className="px-6 py-2 text-slate-500 font-bold text-sm rounded-xl">My Network</button>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Pending Requests */}
                    {pendingRequests.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Users size={16} /> Invitations ({pendingRequests.length})
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {pendingRequests.map((req) => (
                                    <div key={req._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl">
                                                {req.sender.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-900 truncate">{req.sender.name}</h4>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{req.sender.role} • {req.sender.department}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button 
                                                onClick={() => handleAction(req._id, 'accepted')}
                                                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Check size={14} /> Accept
                                            </button>
                                            <button 
                                                onClick={() => handleAction(req._id, 'rejected')}
                                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Users size={16} /> Recommended for you
                            </h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input 
                                    type="text" 
                                    placeholder="Search by company or role..."
                                    className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {suggestedAlumni.map((alumni) => (
                                <motion.div 
                                    key={alumni._id}
                                    whileHover={{ y: -5 }}
                                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group"
                                >
                                    <div className="h-20 bg-slate-50 relative">
                                        <div className="absolute -bottom-6 left-6">
                                            <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg">
                                                <div className="w-full h-full rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                                                    {alumni.user.name.charAt(0)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 pt-10">
                                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{alumni.user.name}</h4>
                                        <p className="text-xs text-slate-500 font-medium mb-4">{alumni.role} at {alumni.company}</p>
                                        
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                <GraduationCap size={14} /> Batch of {alumni.graduationYear}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                <MapPin size={14} /> {alumni.domain}
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => sendRequest(alumni.user._id)}
                                            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                                        >
                                            <UserPlus size={16} /> Connect
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Stats & Tips */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/20">
                        <h3 className="font-black text-xl mb-2">Network Strength</h3>
                        <div className="mt-6 space-y-4">
                            <div className="flex justify-between text-xs font-bold opacity-80">
                                <span>Profile Completion</span>
                                <span>85%</span>
                            </div>
                            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white transition-all duration-1000" style={{ width: '85%' }}></div>
                            </div>
                            <p className="text-xs font-medium opacity-70 leading-relaxed mt-4">
                                Complete your professional details to get 5x more connection requests.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <MessageSquare size={16} /> Recent Conversations
                        </h4>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-50 transition-colors" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate">Alumni Name</p>
                                        <p className="text-[10px] text-slate-500 truncate">Hey, I saw your post about...</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            View All Messages
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Networking;
