import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Calendar, 
    MapPin, 
    User, 
    Image as ImageIcon, 
    Type, 
    Clock, 
    Users, 
    ArrowRight,
    Sparkles,
    Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminEventCreator = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        dateTime: '',
        venue: '',
        organizerName: 'Alumni Association',
        guestAlumni: '',
        type: 'Alumni Meet',
        registrationDeadline: '',
        maxParticipants: 0,
        bannerImage: ''
    });

    const eventTypes = ['Alumni Meet', 'Webinar', 'Workshop', 'Career Guidance', 'Placement Talk', 'Networking Event'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/events', eventData, config);
            alert('Event announced successfully!');
            navigate('/admin/overview');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 pb-20">
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                        <Sparkles size={20} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Announce Event</h1>
                </div>
                <p className="text-slate-500 font-medium">Create a new alumni meet or professional session for the community.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-indigo-600 rounded-full" /> Event Fundamentals
                    </h3>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Event Title</label>
                        <div className="relative">
                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                required
                                className="input-field pl-12"
                                placeholder="e.g. Annual Alumni Gala 2026"
                                value={eventData.title}
                                onChange={(e) => setEventData({...eventData, title: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Event Type</label>
                            <select 
                                className="input-field"
                                value={eventData.type}
                                onChange={(e) => setEventData({...eventData, type: e.target.value})}
                            >
                                {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Banner URL</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    className="input-field pl-12"
                                    placeholder="Image link (Unsplash, etc.)"
                                    value={eventData.bannerImage}
                                    onChange={(e) => setEventData({...eventData, bannerImage: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Detailed Description</label>
                        <textarea 
                            required
                            className="input-field min-h-[150px]"
                            placeholder="Describe the event goals, agenda, and expectations..."
                            value={eventData.description}
                            onChange={(e) => setEventData({...eventData, description: e.target.value})}
                        />
                    </div>
                </div>

                {/* Date & Location */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" /> Logistics & Schedule
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Event Date & Time</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="datetime-local"
                                    required
                                    className="input-field pl-12"
                                    value={eventData.dateTime}
                                    onChange={(e) => setEventData({...eventData, dateTime: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Venue / Platform</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    required
                                    className="input-field pl-12"
                                    placeholder="Conference Hall A or Zoom Link"
                                    value={eventData.venue}
                                    onChange={(e) => setEventData({...eventData, venue: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Organizer Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    required
                                    className="input-field pl-12"
                                    value={eventData.organizerName}
                                    onChange={(e) => setEventData({...eventData, organizerName: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Guest Alumni</label>
                            <div className="relative">
                                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    className="input-field pl-12"
                                    placeholder="e.g. John Doe (Senior VP, Apple)"
                                    value={eventData.guestAlumni}
                                    onChange={(e) => setEventData({...eventData, guestAlumni: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deadline & Capacity */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-amber-500 rounded-full" /> Capacity & Registration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Registration Deadline</label>
                            <input 
                                type="datetime-local"
                                className="input-field"
                                value={eventData.registrationDeadline}
                                onChange={(e) => setEventData({...eventData, registrationDeadline: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Maximum Participants</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="number"
                                    className="input-field pl-12"
                                    placeholder="0 for unlimited"
                                    value={eventData.maxParticipants}
                                    onChange={(e) => setEventData({...eventData, maxParticipants: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)}
                        className="btn-secondary h-14 px-10 rounded-2xl border-slate-200"
                    >
                        Cancel
                    </button>
                    <button 
                        disabled={loading}
                        className="btn-primary h-14 px-12 rounded-2xl shadow-indigo-500/20 shadow-2xl flex items-center gap-2"
                    >
                        {loading ? 'Announcing...' : <><Send size={20} /> Announce Event</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminEventCreator;
