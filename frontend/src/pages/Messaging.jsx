import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, 
    Hash, 
    MessageSquare, 
    Users, 
    Search, 
    MoreVertical, 
    Plus,
    Smile,
    Paperclip,
    Image as ImageIcon,
    Settings,
    Bell,
    Circle,
    X,
    UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Messaging = () => {
    const { user, token } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [alumniList, setAlumniList] = useState([]);
    const [searchAlumni, setSearchAlumni] = useState('');
    const messagesEndRef = useRef(null);
    const socketRef = useRef();

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on('receive_message', (data) => {
            setMessages(prev => {
                // Prevent duplicate messages if optimistic update already added it
                if (prev.some(m => m._id === data._id)) return prev;
                return [...prev, data];
            });
            fetchConversations();
        });

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        fetchConversations();
        fetchContacts();
    }, [token]);

    useEffect(() => {
        if (activeConv) {
            fetchMessages(activeConv._id);
            if (socketRef.current) socketRef.current.emit('join_room', activeConv._id);
        }
    }, [activeConv]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/chat/conversations', config);
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations');
        }
    };

    const fetchContacts = async (search = '') => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(
                `http://localhost:5000/api/alumni/messaging-contacts?search=${encodeURIComponent(search)}`,
                config
            );
            setAlumniList(data);
        } catch (error) {
            console.error('Failed to fetch contacts');
        }
    };

    const fetchMessages = async (convId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`http://localhost:5000/api/chat/messages/${convId}`, config);
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConv) return;

        const messageData = {
            conversationId: activeConv._id,
            content: newMessage,
            messageType: 'text'
        };

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('http://localhost:5000/api/chat/messages', messageData, config);
            
            // Optimistic Update
            setMessages(prev => [...prev, data]);
            setNewMessage('');

            if (socketRef.current) {
                socketRef.current.emit('send_message', {
                    ...data,
                    roomId: activeConv._id
                });
            }
        } catch (error) {
            console.error('Failed to send message');
        }
    };

    const startConversation = async (recipientId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('http://localhost:5000/api/chat/conversation', { recipientId }, config);
            setActiveConv(data);
            setShowNewMessageModal(false);
            fetchConversations();
        } catch (error) {
            console.error('Failed to start conversation');
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-900 overflow-hidden">
            {/* Sidebar - Channels/Chats List */}
            <div className="w-80 bg-slate-800 flex flex-col border-r border-slate-700 shadow-2xl">
                <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                    <h2 className="text-white font-black text-2xl tracking-tight">Messages</h2>
                    <button 
                        onClick={() => setShowNewMessageModal(true)}
                        className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search chats..." 
                            className="w-full bg-slate-900/50 border border-slate-700 text-slate-300 text-xs py-3 pl-10 pr-4 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-4 flex items-center justify-between mt-4">
                        <span>Recent Chats</span>
                    </div>
                    {conversations.map((conv) => {
                        const otherParticipant = conv.participants.find(p => p._id !== user._id);
                        return (
                            <button
                                key={conv._id}
                                onClick={() => setActiveConv(conv)}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group mb-1
                                    ${activeConv?._id === conv._id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}
                            >
                                <div className="relative shrink-0">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-md
                                        ${activeConv?._id === conv._id ? 'bg-white/20' : 'bg-slate-700 text-white'}`}>
                                        {conv.isGroup ? <Users size={20} /> : otherParticipant?.name?.charAt(0)}
                                    </div>
                                    <Circle className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 fill-emerald-500 stroke-slate-800 ${activeConv?._id === conv._id && 'stroke-indigo-600'}`} />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className={`text-sm font-black truncate ${activeConv?._id === conv._id ? 'text-white' : 'text-slate-200'}`}>
                                        {conv.isGroup ? conv.groupName : otherParticipant?.name}
                                    </p>
                                    <p className={`text-[11px] truncate mt-0.5 ${activeConv?._id === conv._id ? 'text-indigo-100' : 'text-slate-500 font-medium'}`}>
                                        {conv.lastMessage?.content || 'No messages yet'}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* User Status Card */}
                <div className="p-4 bg-slate-900/50 m-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                        {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
                        </p>
                    </div>
                    <Settings size={16} className="text-slate-500 cursor-pointer hover:text-white transition-colors" />
                </div>
            </div>

            {/* Main Chat Area */}
            {activeConv ? (
                <div className="flex-1 flex flex-col bg-slate-700/50 shadow-2xl relative">
                    {/* Chat Header */}
                    <div className="h-20 border-b border-slate-700/50 flex items-center justify-between px-8 bg-slate-800/40 backdrop-blur-xl sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="text-slate-500 font-black text-2xl">
                                {activeConv.isGroup ? <Hash size={24} /> : <span className="opacity-50">@</span>}
                            </div>
                            <div>
                                <h3 className="text-white font-black text-lg tracking-tight">
                                    {activeConv.isGroup ? activeConv.groupName : activeConv.participants.find(p => p._id !== user._id)?.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Now</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-5 text-slate-400">
                            <button className="p-2 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><Bell size={20} /></button>
                            <button className="p-2 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><Users size={20} /></button>
                            <button className="p-2 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><MoreVertical size={20} /></button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-600">
                                    <MessageSquare size={32} />
                                </div>
                                <h4 className="text-slate-400 font-bold">No messages here yet</h4>
                                <p className="text-slate-500 text-xs max-w-[200px]">Send a message to start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.sender?._id === user?._id;
                                const showAvatar = idx === 0 || messages[idx-1]?.sender?._id !== msg.sender?._id;

                                return (
                                    <div key={msg._id} className={`flex gap-4 group ${showAvatar ? 'mt-6' : 'mt-1'}`}>
                                        <div className="w-12 shrink-0">
                                            {showAvatar && (
                                                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-white font-black shadow-lg border border-slate-700">
                                                    {msg.sender?.name?.charAt(0) || '?'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {showAvatar && (
                                                <div className="flex items-baseline gap-3 mb-1.5">
                                                    <span className="text-white font-black text-sm hover:text-indigo-400 cursor-pointer transition-colors">{msg.sender?.name || 'Unknown'}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-6 bg-slate-800/40">
                        <form 
                            onSubmit={handleSendMessage}
                            className="bg-slate-900/50 border border-slate-700/50 rounded-2xl flex items-center px-6 py-4 gap-4 shadow-2xl focus-within:ring-2 ring-indigo-500/30 transition-all"
                        >
                            <button type="button" className="text-slate-500 hover:text-white transition-colors">
                                <Plus className="bg-slate-700 rounded-full text-slate-400 p-1 hover:bg-indigo-600 hover:text-white transition-all" size={24} />
                            </button>
                            <input 
                                type="text" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={`Message ${activeConv.isGroup ? '#' + activeConv.groupName : '@' + activeConv.participants.find(p => p._id !== user._id)?.name}`}
                                className="flex-1 bg-transparent border-none text-slate-100 text-sm font-medium focus:outline-none placeholder:text-slate-600"
                            />
                            <div className="flex items-center gap-4 text-slate-500">
                                <ImageIcon size={22} className="cursor-pointer hover:text-white transition-colors" />
                                <Paperclip size={22} className="cursor-pointer hover:text-white transition-colors" />
                                <Smile size={22} className="cursor-pointer hover:text-white transition-colors" />
                                <button type="submit" className="text-indigo-500 hover:text-indigo-400 hover:scale-110 active:scale-95 transition-all">
                                    <Send size={24} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-800/20 backdrop-blur-sm">
                    <div className="w-24 h-24 bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600 mb-8 border border-slate-700 shadow-2xl">
                        <MessageSquare size={48} />
                    </div>
                    <h3 className="text-white font-black text-3xl tracking-tight">Select a conversation</h3>
                    <p className="text-slate-500 font-bold mt-3 max-w-[280px] text-center leading-relaxed">
                        Pick a colleague or group from the sidebar to start collaborating.
                    </p>
                    <button 
                        onClick={() => setShowNewMessageModal(true)}
                        className="mt-10 btn-primary px-10 h-14 flex items-center gap-3 shadow-indigo-600/20 shadow-2xl text-lg"
                    >
                        <Plus size={24} /> Start New Chat
                    </button>
                </div>
            )}

            {/* New Message Modal */}
            <AnimatePresence>
                {showNewMessageModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNewMessageModal(false)}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-slate-700"
                        >
                            <div className="p-8 border-b border-slate-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-black text-white tracking-tight">New Message</h3>
                                    <button onClick={() => setShowNewMessageModal(false)} className="p-2 text-slate-500 hover:text-white rounded-xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search students & alumni by name..." 
                                        className="w-full bg-slate-900 border border-slate-700 text-white py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-medium"
                                        value={searchAlumni}
                                        onChange={(e) => { setSearchAlumni(e.target.value); fetchContacts(e.target.value); }}
                                    />
                                </div>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar">
                                {alumniList.length === 0 && (
                                    <div className="py-12 text-center">
                                        <p className="text-slate-500 font-medium">
                                            {searchAlumni ? 'No users found matching your search.' : 'No contacts available.'}
                                        </p>
                                    </div>
                                )}
                                {alumniList.map((contact) => (
                                    <button 
                                        key={contact._id}
                                        onClick={() => startConversation(contact._id)}
                                        className="w-full flex items-center gap-4 p-4 hover:bg-slate-700/50 rounded-2xl transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black shadow-lg">
                                            {contact.name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-black group-hover:text-indigo-400 transition-colors">{contact.name}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    contact.role === 'alumni' 
                                                        ? 'bg-indigo-900 text-indigo-400' 
                                                        : 'bg-emerald-900 text-emerald-400'
                                                }`}>
                                                    {contact.role}
                                                </span>
                                                {contact.isVerified && contact.role === 'alumni' && (
                                                    <span className="px-2 py-0.5 bg-amber-900 text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest">✓ Verified</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold mt-0.5">
                                                {contact.jobTitle ? `${contact.jobTitle} • ${contact.company}` : contact.email}
                                            </p>
                                        </div>
                                        <UserPlus size={20} className="text-slate-600 group-hover:text-indigo-500 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Messaging;
