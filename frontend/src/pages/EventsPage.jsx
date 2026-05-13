import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Users, 
    ChevronRight, 
    Sparkles, 
    Filter,
    Search,
    CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const categories = ['All', 'Alumni Meet', 'Webinar', 'Workshop', 'Career Guidance', 'Networking Event'];

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/events', config);
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    const normalizedEvents = events.map(e => ({
        ...e,
        displayDate: e.dateTime || e.date,
        displayTime: e.dateTime ? new Date(e.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (e.time || ''),
        creatorRole: e.createdBy?.role || e.organizer?.role || 'alumni'
    }));

    const filteredEvents = activeTab === 'All' 
        ? normalizedEvents.filter(e => {
            if (user?.role === 'student') {
                return (e.type || '').toLowerCase() !== 'alumni meet';
            }
            return true;
        })
        : normalizedEvents.filter(e => {
            const matchesTab = (e.type || '').toLowerCase() === activeTab.toLowerCase();
            if (user?.role === 'student') {
                return matchesTab && (e.type || '').toLowerCase() !== 'alumni meet';
            }
            return matchesTab;
        });

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
            {/* Hero Section */}
            <div className="relative bg-slate-900 rounded-[3rem] p-12 overflow-hidden text-white shadow-2xl shadow-indigo-900/20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 blur-[120px] rounded-full -mr-40 -mt-40" />
                <div className="relative z-10 max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                        <Sparkles size={18} className="text-amber-400" />
                        <span className="text-xs font-black uppercase tracking-widest">Connect & Grow</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
                        Experience the Power of <span className="text-indigo-400">Networking.</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed">
                        Join exclusive alumni meets, workshops, and career sessions. 
                        Interact with industry leaders and mark your presence.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-6 h-12 rounded-2xl font-bold text-sm transition-all ${
                                activeTab === cat 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                                : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-500 hover:text-indigo-600'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input className="input-field pl-12 h-12 w-64 bg-white" placeholder="Search events..." />
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-96 bg-white border border-slate-100 animate-pulse rounded-[2.5rem]" />)
                ) : filteredEvents.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-500 font-bold">No events found in this category.</p>
                    </div>
                ) : (
                    filteredEvents.map((event, i) => (
                        <motion.div
                            key={event._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group overflow-hidden flex flex-col"
                        >
                            <div className="h-48 relative overflow-hidden">
                                <img 
                                    src={event.bannerImage || event.banner || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800`} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                    alt="Event"
                                />
                                <div className="absolute top-6 left-6">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                                        {event.type}
                                    </span>
                                </div>
                                {event.userStatus === 'Attending' && (
                                    <div className="absolute top-6 right-6">
                                        <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg">
                                            <CheckCircle2 size={18} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 flex-grow space-y-4">
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-indigo-500" /> {new Date(event.displayDate).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-indigo-500" /> {event.displayTime}</span>
                                </div>
                                
                                <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                    {event.title}
                                </h3>

                                <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                    <MapPin size={16} className="text-rose-500" />
                                    {event.venue}
                                </div>

                                <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
                                    {event.description}
                                </p>
                            </div>

                            <div className="px-8 py-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                                <div className="flex -space-x-3 overflow-hidden">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200" />
                                    ))}
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-indigo-600 text-[8px] font-black text-white">
                                        +{event.stats?.attending || 0}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate(`/events/${event._id}`)}
                                    className="px-6 h-11 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10"
                                >
                                    Join Meet <ChevronRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EventsPage;
