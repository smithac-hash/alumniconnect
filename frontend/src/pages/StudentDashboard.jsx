import React, { useState, useEffect } from 'react';
import { 
    Briefcase, 
    Calendar, 
    MessageSquare, 
    ChevronRight, 
    Users, 
    TrendingUp, 
    Search,
    Plus,
    MapPin,
    Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [eventsRes, jobsRes, postsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/events', config),
                axios.get('http://localhost:5000/api/jobs/recommended', config).catch(() => ({ data: [] })),
                axios.get('http://localhost:5000/api/posts', config)
            ]);
            const normalizedEvents = eventsRes.data.map(e => ({
                ...e,
                displayDate: e.dateTime || e.date,
                displayTime: e.dateTime ? new Date(e.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (e.time || ''),
                creatorRole: e.createdBy?.role || e.organizer?.role || 'alumni' // Fallback for legacy
            }));

            const studentSpecificEvents = normalizedEvents.filter(e => {
                const type = (e.type || '').toLowerCase();
                // Hide Alumni Meets for students
                if (type === 'alumni meet') return false;
                // Allow all other professional events (webinars, workshops, etc.)
                return true;
            });
            setUpcomingEvents(studentSpecificEvents.slice(0, 3));
            setRecommendedJobs(jobsRes.data.slice(0, 2));
            setPosts(postsRes.data.slice(0, 3));
        } catch (error) {
            console.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const DashboardCard = ({ icon: Icon, title, value, color, bg }) => (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hey, {user?.name.split(' ')[0]}! ✨</h1>
                    <p className="text-slate-500 font-medium mt-2">Ready to connect with your seniors and find opportunities?</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            placeholder="Search alumni, jobs..." 
                            className="pl-10 pr-4 h-12 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none w-64"
                        />
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard icon={Users} title="Alumni Network" value="1.4k+" color="text-indigo-600" bg="bg-indigo-50" />
                <DashboardCard icon={Briefcase} title="Open Roles" value={recommendedJobs.length || '—'} color="text-emerald-600" bg="bg-emerald-50" />
                <DashboardCard icon={Calendar} title="Live Sessions" value={upcomingEvents.length || '—'} color="text-amber-600" bg="bg-amber-50" />
                <DashboardCard icon={MessageSquare} title="Feed Posts" value={posts.length || '—'} color="text-rose-600" bg="bg-rose-50" />
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
                {/* Main Feed */}
                <div className="lg:col-span-8 space-y-10">
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-slate-900">Recommended Jobs</h2>
                            <Link to="/jobs" className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                View Portal <ChevronRight size={14} />
                            </Link>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {loading ? (
                                [1,2].map(i => <div key={i} className="h-56 rounded-[2.5rem] bg-white border border-slate-100 animate-pulse" />)
                            ) : recommendedJobs.length === 0 ? (
                                <div className="col-span-2 text-center py-12 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                    <Briefcase size={32} className="text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">No recommended jobs yet. <Link to="/jobs" className="text-indigo-600 font-bold">Browse all →</Link></p>
                                </div>
                            ) : (
                                recommendedJobs.map(job => (
                                    <div key={job._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden p-2">
                                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=f8fafc&color=6366f1&bold=true`} className="w-full h-full object-contain" alt="Logo" />
                                            </div>
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{job.type}</span>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                        <p className="text-sm text-slate-500 font-bold mb-6">{job.company}</p>
                                        <button onClick={() => navigate('/jobs')} className="w-full h-12 bg-slate-50 text-slate-900 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all">View & Apply</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-slate-900">Community Highlights</h2>
                            <Link to="/feed" className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                                Join Conversation <ChevronRight size={14} />
                            </Link>
                        </div>
                        <div className="space-y-6">
                            {loading ? (
                                [1,2].map(i => <div key={i} className="h-36 rounded-[2.5rem] bg-white border border-slate-100 animate-pulse" />)
                            ) : posts.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                    <TrendingUp size={32} className="text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">No posts yet. <Link to="/feed" className="text-indigo-600 font-bold">Be the first to post →</Link></p>
                                </div>
                            ) : (
                                posts.map(post => (
                                    <div key={post._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex gap-6 hover:shadow-md transition-all">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">
                                            {post.author?.name?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-black text-slate-900">{post.author?.name}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">• {new Date(post.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900 mb-3 truncate">{post.title}</h3>
                                            <p className="text-slate-500 font-medium text-sm line-clamp-2 leading-relaxed mb-4">{post.content}</p>
                                            <div className="flex items-center gap-6">
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400"><TrendingUp size={14} /> {post.likes?.length || 0} Likes</span>
                                                <Link to="/feed" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-600"><MessageSquare size={14} /> View in Feed</Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-600/20">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black">Live Sessions</h3>
                            <Calendar size={20} className="text-indigo-300" />
                        </div>
                        <div className="space-y-6">
                            {upcomingEvents.map(event => (
                                <div key={event._id} className="flex gap-4 group cursor-pointer">
                                    <div className="text-center shrink-0">
                                        <p className="text-[10px] font-black text-indigo-300 uppercase">{new Date(event.displayDate).toLocaleDateString('en-US', { month: 'short' })}</p>
                                        <p className="text-xl font-black">{new Date(event.displayDate).getDate()}</p>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-black truncate group-hover:text-indigo-200 transition-colors">{event.title}</h4>
                                        <p className="text-[10px] text-indigo-300 font-bold mt-1 uppercase tracking-widest">
                                            {event.displayTime} • {event.venue || 'Online'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link to="/events" className="w-full h-12 bg-white text-indigo-600 rounded-xl font-black text-xs hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 mt-8">
                            Explore All <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
