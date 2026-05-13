import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, Clock, MapPin, Users, Send, ArrowLeft, 
    MessageSquare, Bell, Info, ChevronRight, CheckCircle2,
    Smile, Paperclip, MoreVertical, Pin, Trash2, Shield
} from 'lucide-react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const EventDetails = () => {
    const { id } = useParams();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [attendees, setAttendees] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('discussion'); // 'discussion', 'info', 'attendees'
    const scrollRef = useRef();
    const socketRef = useRef();

    useEffect(() => {
        fetchEventDetails();
        if (user?.role === 'admin') fetchAttendees();
        setupSocket();
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [id]);

    const fetchAttendees = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`http://localhost:5000/api/events/${id}/attendees`, config);
            setAttendees(data);
        } catch (error) {
            console.error('Failed to fetch attendees');
        }
    };

    const fetchEventDetails = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [eventRes, msgRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/events`, config),
                axios.get(`http://localhost:5000/api/events/${id}/messages`, config)
            ]);
            
            const eventData = eventRes.data.find(e => e._id === id);
            if (eventData) {
                const normalized = {
                    ...eventData,
                    displayDate: eventData.dateTime || eventData.date,
                    displayTime: eventData.dateTime ? new Date(eventData.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (eventData.time || ''),
                    organizerName: eventData.organizerName || eventData.organizer?.name || 'Alumni Association'
                };
                setEvent(normalized);
            }
            setMessages(msgRes.data);
        } catch (error) {
            console.error('Failed to fetch event details');
        } finally {
            setLoading(false);
        }
    };

    const setupSocket = () => {
        socketRef.current = io('http://localhost:5000');
        socketRef.current.emit('join_room', `event_${id}`);
        
        socketRef.current.on('new_event_message', (message) => {
            setMessages(prev => [...prev, message]);
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`http://localhost:5000/api/events/${id}/messages`, { content: newMessage }, config);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message');
        }
    };

    const handleRSVP = async (status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`http://localhost:5000/api/events/${id}/rsvp`, { status }, config);
            fetchEventDetails(); // Refresh to get updated stats and status
        } catch (error) {
            alert('Failed to RSVP');
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (loading || !event) return <div className="p-20 text-center font-bold text-slate-500">Loading Event...</div>;

    const getTimeRemaining = () => {
        const dateToUse = event.displayDate;
        if (!dateToUse) return { total: 0 };
        const total = Date.parse(dateToUse) - Date.parse(new Date());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        return { total, days, hours, minutes, seconds };
    };

    const countdown = getTimeRemaining();

    return (
        <div className="max-w-7xl mx-auto min-h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-[#f8fafc]">
            {/* Left Sidebar: Event Info & RSVP */}
            <aside className="w-full lg:w-[400px] bg-white border-r border-slate-200 p-8 flex flex-col h-full overflow-y-auto">
                <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-8 transition-colors group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Events
                </button>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            {event.type}
                        </span>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{event.title}</h1>
                        <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                            <span className="flex items-center gap-1.5"><Calendar size={16} /> {new Date(event.displayDate).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1.5"><Clock size={16} /> {event.displayTime}</span>
                        </div>
                    </div>

                    {/* Countdown */}
                    {countdown.total > 0 && (
                        <div className="p-6 bg-slate-900 rounded-3xl text-white">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 text-center">Starting In</p>
                            <div className="flex justify-between items-center px-2">
                                <TimeBlock value={countdown.days} label="Days" />
                                <TimeBlock value={countdown.hours} label="Hrs" />
                                <TimeBlock value={countdown.minutes} label="Mins" />
                                <TimeBlock value={countdown.seconds} label="Secs" />
                            </div>
                        </div>
                    )}

                    {/* RSVP Poll */}
                    <div className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <CheckCircle2 size={20} className="text-emerald-500" /> Will you be there?
                        </h3>
                        <div className="space-y-2">
                            <RSVPButton 
                                label="Attending" 
                                active={event.userStatus === 'Attending'} 
                                count={event.stats?.attending || 0}
                                color="bg-emerald-500"
                                onClick={() => handleRSVP('Attending')}
                            />
                            <RSVPButton 
                                label="Maybe" 
                                active={event.userStatus === 'Maybe'} 
                                count={event.stats?.maybe || 0}
                                color="bg-amber-500"
                                onClick={() => handleRSVP('Maybe')}
                            />
                            <RSVPButton 
                                label="Not Attending" 
                                active={event.userStatus === 'Not Attending'} 
                                count={event.stats?.notAttending || 0}
                                color="bg-rose-500"
                                onClick={() => handleRSVP('Not Attending')}
                            />
                        </div>
                    </div>

                    {/* Event Logistics */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><MapPin size={20} /></div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Venue</p>
                                <p className="text-sm font-bold text-slate-700">{event.venue}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600"><Users size={20} /></div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Organizer</p>
                                <p className="text-sm font-bold text-slate-700">{event.organizerName}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content: Group Chat & Discussion */}
            <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
                {/* Chat Header */}
                <header className="bg-white border-b border-slate-200 px-8 h-20 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h2 className="font-black text-slate-900 leading-none">Event Discussion</h2>
                            <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> {event.stats?.attending || 0} Attending
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {(user?.role === 'admin' || 
                          user?._id === (event.createdBy?._id || event.createdBy) || 
                          user?._id === event.organizer) && (
                            <div className="flex bg-slate-100 p-1 rounded-xl mr-4">
                                <button 
                                    onClick={() => setActiveTab('discussion')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'discussion' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    Chat
                                </button>
                                <button 
                                    onClick={() => setActiveTab('attendees')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'attendees' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    Attendees ({attendees.length})
                                </button>
                            </div>
                        )}
                        <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400"><Bell size={20} /></button>
                        <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400"><Info size={20} /></button>
                    </div>
                </header>

                {/* Messages or Attendees Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-white/50 backdrop-blur-sm">
                    {activeTab === 'attendees' ? (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-900">Participation Tracking</h3>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg">Attending: {event.stats?.attending}</span>
                                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg">Maybe: {event.stats?.maybe}</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {attendees.map((rsvp, idx) => (
                                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                                {rsvp.user?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 leading-none mb-1">{rsvp.user?.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{rsvp.user?.role} • {rsvp.user?.email}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                            rsvp.status === 'Attending' ? 'bg-emerald-50 text-emerald-600' : 
                                            rsvp.status === 'Maybe' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                            {rsvp.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12">
                            <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-400 mb-6">
                                <MessageSquare size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Start the discussion!</h3>
                            <p className="text-slate-500 font-medium max-w-xs mt-2">Introduce yourself or ask a question about the meet.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.sender?._id === user?._id ? 'flex-row-reverse' : ''}`}>
                                <div className="w-10 h-10 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-sm border border-white">
                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.name)}&background=random`} className="w-full h-full" alt="User" />
                                </div>
                                <div className={`flex flex-col max-w-[70%] ${msg.sender?._id === user?._id ? 'items-end' : ''}`}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-xs font-black text-slate-900">{msg.sender?.name}</span>
                                        <span className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-black uppercase tracking-tighter rounded-md text-slate-500">{msg.sender?.role}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                                        msg.sender?._id === user?._id 
                                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-200' 
                                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <div className={`p-8 bg-white border-t border-slate-200 shrink-0 ${activeTab === 'attendees' ? 'hidden' : ''}`}>
                    <form onSubmit={handleSendMessage} className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
                            <button type="button" className="p-2 hover:text-indigo-600 transition-colors"><Smile size={20} /></button>
                            <button type="button" className="p-2 hover:text-indigo-600 transition-colors"><Paperclip size={20} /></button>
                        </div>
                        <input 
                            className="w-full h-14 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl pl-24 pr-20 transition-all font-medium text-slate-700"
                            placeholder="Type your message here..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button 
                            type="submit"
                            className="absolute right-2 top-2 h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

const TimeBlock = ({ value, label }) => (
    <div className="text-center">
        <div className="text-2xl font-black">{value.toString().padStart(2, '0')}</div>
        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
);

const RSVPButton = ({ label, active, count, color, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
            active 
            ? `border-${color.split('-')[1]}-500 bg-${color.split('-')[1]}-50` 
            : 'border-white bg-white hover:border-slate-200'
        }`}
    >
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${color} ${active ? 'animate-pulse' : 'opacity-40'}`} />
            <span className={`text-sm font-bold ${active ? 'text-slate-900' : 'text-slate-500'}`}>{label}</span>
        </div>
        <span className={`text-xs font-black ${active ? 'text-indigo-600' : 'text-slate-400'}`}>{count}</span>
    </button>
);

export default EventDetails;
