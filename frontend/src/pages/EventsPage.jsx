import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, Users, ExternalLink, MapPin, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { user } = useAuth();
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        meetingLink: ''
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
            const { data } = await axios.get('http://localhost:5000/api/events', config);
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    const handlePostEvent = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/events', formData, config);
            setShowModal(false);
            fetchEvents();
        } catch (error) {
            alert('Failed to post event');
        }
    };

    const handleRegister = async (id) => {
        if (!user) return alert('Please login to register');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`http://localhost:5000/api/events/${id}/register`, {}, config);
            alert('Registered successfully!');
            fetchEvents();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to register');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                <div className="max-w-2xl">
                    <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Live <span className="gradient-text">Webinars</span> & Sessions</h1>
                    <p className="text-xl text-slate-500 leading-relaxed">
                        Learn directly from alumni who have been in your shoes. Get insider tips, career advice, and technical knowledge.
                    </p>
                </div>
                
                <div className="flex gap-4">
                    {(user?.role === 'alumni' || user?.role === 'admin') && (
                        <button 
                            onClick={() => setShowModal(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Propose a Session
                        </button>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-3xl" />)
                ) : events.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-500 font-medium">No events scheduled yet.</p>
                    </div>
                ) : (
                    events.map((event, i) => (
                        <motion.div 
                            key={event._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card flex flex-col group overflow-hidden"
                        >
                            <div className="p-8 flex-grow">
                                <div className="flex items-center gap-3 text-blue-600 mb-6 bg-blue-50 w-fit px-4 py-1.5 rounded-full">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                                    {event.title}
                                </h3>
                                
                                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                    {event.description}
                                </p>

                                <div className="space-y-4 pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-4 text-slate-700">
                                        <Link to={`/alumni/${event.organizer?._id}`}>
                                            <img 
                                                src={event.alumniProfile?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.organizer?.name || 'Alumni')}&background=2563eb&color=fff`} 
                                                alt={event.organizer?.name}
                                                className="w-12 h-12 rounded-xl border-2 border-transparent hover:border-blue-600 transition-colors object-cover"
                                            />
                                        </Link>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Host</p>
                                            <p className="text-sm font-bold text-slate-900">
                                                <Link to={`/alumni/${event.organizer?._id}`} className="hover:text-blue-600">{event.organizer?.name}</Link>
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {event.alumniProfile?.role || 'Alumni'} {event.alumniProfile?.company ? `at ${event.alumniProfile.company}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 pt-2">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Clock className="w-4 h-4" />
                                            {event.time}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Users className="w-4 h-4" />
                                            {event.attendees?.length || 0} registered
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                    <Video className="w-4 h-4" />
                                    Online Event
                                </div>
                                {event.attendees?.includes(user?._id) ? (
                                    <span className="text-blue-600 font-bold text-sm px-4 py-2 bg-blue-50 rounded-xl">
                                        Registered
                                    </span>
                                ) : (
                                    <button 
                                        onClick={() => handleRegister(event._id)}
                                        className="btn-primary py-2 px-6 text-sm"
                                    >
                                        Register Now
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Post Event Modal */}
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
                                <h2 className="text-2xl font-bold text-slate-900">Propose New Session</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handlePostEvent} className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Event Title</label>
                                    <input 
                                        required
                                        className="input-field"
                                        placeholder="e.g. Masterclass on System Design"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Date</label>
                                    <input 
                                        required
                                        type="date"
                                        className="input-field"
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Time</label>
                                    <input 
                                        required
                                        className="input-field"
                                        placeholder="6:00 PM - 7:30 PM"
                                        value={formData.time}
                                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Meeting Link (Zoom/GMeet)</label>
                                    <input 
                                        required
                                        className="input-field"
                                        placeholder="https://meet.google.com/..."
                                        value={formData.meetingLink}
                                        onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Description</label>
                                    <textarea 
                                        required
                                        className="input-field min-h-[120px] pt-3"
                                        placeholder="What will this session cover?"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                                <button type="submit" className="col-span-2 btn-primary h-14 mt-4">
                                    Publish Event
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EventsPage;

