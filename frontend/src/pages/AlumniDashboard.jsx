import React, { useState, useEffect } from 'react';
import { 
    Briefcase, 
    MessageSquare, 
    Users, 
    TrendingUp, 
    Calendar, 
    Award,
    ChevronRight,
    Loader2,
    Shield,
    Edit3
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AlumniDashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({
        connections: 0,
        sessions: 0,
        posts: 0,
        mentees: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [profileRes, statsRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/alumni/profile/${user._id}`, config),
                    axios.get('http://localhost:5000/api/alumni/stats', config).catch(() => ({ data: null }))
                ]);
                
                if (profileRes.data) setProfile(profileRes.data);
                if (statsRes.data) setStats(statsRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data');
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchDashboardData();
    }, [user._id, token]);

    const QuickAction = ({ icon: Icon, title, subtitle, color, to }) => (
        <button 
            onClick={() => navigate(to)}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group text-left w-full"
        >
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Icon size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500 font-medium mb-4">{subtitle}</p>
            <div className="flex items-center text-xs font-black text-indigo-600 uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
                Access Now <ChevronRight size={14} />
            </div>
        </button>
    );

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
                    <p className="text-slate-500 font-medium mt-2">Manage your professional presence and network.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/profile/edit')} className="btn-secondary h-12 px-6 flex items-center gap-2 border-slate-200">
                        <Edit3 size={18} /> Edit Profile
                    </button>
                    <button onClick={() => navigate('/settings/privacy')} className="btn-primary h-12 px-6 flex items-center gap-2 shadow-indigo-500/20 shadow-xl">
                        <Shield size={18} /> Privacy
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Connections', value: stats.connections || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Sessions', value: stats.sessions || 0, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Total Posts', value: stats.posts || 0, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Active Mentees', value: stats.mentees || 0, icon: Award, color: 'text-rose-600', bg: 'bg-rose-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <QuickAction 
                    icon={TrendingUp} 
                    title="Community Feed" 
                    subtitle="Share updates with the network."
                    color="bg-indigo-600 text-white"
                    to="/feed"
                />
                <QuickAction 
                    icon={Calendar} 
                    title="Sessions" 
                    subtitle="Manage your live workshops."
                    color="bg-emerald-500 text-white"
                    to="/events"
                />
                <QuickAction 
                    icon={MessageSquare} 
                    title="Messaging" 
                    subtitle="Real-time chat with students."
                    color="bg-amber-500 text-white"
                    to="/messaging"
                />
                <QuickAction 
                    icon={Users} 
                    title="Networking" 
                    subtitle="Grow your alumni connections."
                    color="bg-slate-900 text-white"
                    to="/networking"
                />
            </div>

            {/* Account Status / Profile Summary */}
            <div className="grid lg:grid-cols-3 gap-12 pt-8">
                <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-full">
                        <h2 className="text-xl font-black text-slate-900 mb-6">Profile Overview</h2>
                        {profile ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{profile.role}</p>
                                        <p className="text-sm text-slate-500">{profile.company}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border border-slate-100 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Domain</p>
                                        <p className="font-bold text-slate-900">{profile.domain}</p>
                                    </div>
                                    <div className="p-4 border border-slate-100 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                                        <p className="font-bold text-slate-900">{profile.experience} Years</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <p className="text-slate-500 font-medium mb-4">You haven't completed your professional profile yet.</p>
                                <button onClick={() => navigate('/profile/edit')} className="btn-primary px-6 h-12">Setup Profile</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20">
                        <h3 className="text-xl font-black mb-4">Account Status</h3>
                        <div className="flex items-center gap-3 mb-8">
                            {user.isVerified ? (
                                <>
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Verified Alumni</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Verification Pending</span>
                                </>
                            )}
                        </div>
                        <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                            Verified members get exclusive access to mentorship programs and placement talks.
                        </p>
                        <button onClick={() => navigate('/profile/edit')} className="w-full h-14 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl font-black transition-all">
                            Manage Identity
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlumniDashboard;
