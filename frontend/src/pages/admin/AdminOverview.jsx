import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Users, 
    UserPlus, 
    Briefcase, 
    Calendar, 
    ShieldCheck, 
    ShieldAlert,
    TrendingUp,
    Activity
} from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminOverview = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const [statsRes, activitiesRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/stats', config),
                    axios.get('http://localhost:5000/api/admin/activities', config)
                ]);
                setStats(statsRes.data);
                setActivities(activitiesRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.token]);

    const chartData = [
        { name: 'Jan', students: 400, alumni: 240 },
        { name: 'Feb', students: 300, alumni: 139 },
        { name: 'Mar', students: 200, alumni: 980 },
        { name: 'Apr', students: 278, alumni: 390 },
        { name: 'May', students: 189, alumni: 480 },
        { name: 'Jun', students: 239, alumni: 380 },
    ];

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Overview</h2>
                    <p className="text-slate-500 font-medium">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                    </div>
                    <span className="text-xs font-bold text-slate-400">ADMIN TEAM ACTIVE</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Students" 
                    value={stats?.totalStudents || 0} 
                    icon={<Users />} 
                    trend={12} 
                    color="bg-blue-600" 
                />
                <StatCard 
                    title="Total Alumni" 
                    value={stats?.totalAlumni || 0} 
                    icon={<UserPlus />} 
                    trend={8} 
                    color="bg-indigo-600" 
                    delay={0.1}
                />
                <StatCard 
                    title="Pending Verifications" 
                    value={stats?.pendingAlumni || 0} 
                    icon={<ShieldAlert />} 
                    trend={-5} 
                    color="bg-amber-500" 
                    delay={0.2}
                />
                <StatCard 
                    title="Job Posts" 
                    value={stats?.totalJobs || 0} 
                    icon={<Briefcase />} 
                    trend={15} 
                    color="bg-emerald-500" 
                    delay={0.3}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Chart */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">User Growth</h3>
                                <p className="text-sm text-slate-500">Monthly student and alumni registration</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold">
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-600"></span> STUDENTS</div>
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-200"></span> ALUMNI</div>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="students" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                                    <Area type="monotone" dataKey="alumni" stroke="#e0e7ff" strokeWidth={3} fill="none" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Department Distribution</h3>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'CSE', value: 400 },
                                                { name: 'ECE', value: 300 },
                                                { name: 'ME', value: 200 },
                                                { name: 'CE', value: 100 },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {COLORS.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Placement Status</h3>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: '2021', placed: 85 },
                                        { name: '2022', placed: 92 },
                                        { name: '2023', placed: 88 },
                                        { name: '2024', placed: 95 },
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="placed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Recent Activity */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                            <Activity size={20} className="text-slate-400" />
                        </div>
                        <div className="space-y-6">
                            {activities.map((activity, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => activity.type === 'user' ? navigate('/admin/users') : navigate('/admin/jobs')}
                                    className="flex gap-4 group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-all"
                                >
                                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-colors
                                        ${activity.type === 'user' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}
                                    >
                                        {activity.type === 'user' ? <UserPlus size={18} /> : <Briefcase size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                                            {activity.content}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 font-medium italic">
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => navigate('/admin/users')}
                            className="w-full mt-8 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            View All Activity
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
