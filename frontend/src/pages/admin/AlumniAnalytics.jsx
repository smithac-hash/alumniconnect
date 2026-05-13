import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend
} from 'recharts';
import { 
    Users, 
    CheckCircle, 
    Briefcase, 
    Globe, 
    TrendingUp, 
    GraduationCap, 
    MapPin,
    Building2,
    Search,
    Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AlumniAnalytics = () => {
    const { token } = useAuth();
    const [overview, setOverview] = useState(null);
    const [careerStats, setCareerStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const [overviewRes, careerRes] = await Promise.all([
                axios.get('http://localhost:5000/api/analytics/overview', config),
                axios.get('http://localhost:5000/api/analytics/alumni-career', config)
            ]);

            setOverview(overviewRes.data);
            setCareerStats(careerRes.data);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="p-8 space-y-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-96 bg-slate-50 rounded-[2.5rem]" />
                <div className="h-96 bg-slate-50 rounded-[2.5rem]" />
            </div>
        </div>
    );

    return (
        <div className="p-8 space-y-10 min-h-screen pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Alumni Intelligence</h1>
                    <p className="text-slate-500 font-medium">Real-time career trends and placement analytics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchAnalytics} className="btn-secondary h-12 px-6 flex items-center gap-2 rounded-2xl border-slate-200">
                        <TrendingUp size={18} /> Refresh Data
                    </button>
                    <button className="btn-primary h-12 px-8 flex items-center gap-2 rounded-2xl shadow-indigo-500/20 shadow-xl">
                        <Globe size={18} /> Export Report
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="Total Alumni" 
                    value={overview?.totalAlumni || 0} 
                    icon={<Users className="text-indigo-600" />}
                    trend="+12% from last batch"
                    color="bg-indigo-50"
                />
                <KPICard 
                    title="Verified Members" 
                    value={overview?.verifiedAlumni || 0} 
                    icon={<CheckCircle className="text-emerald-600" />}
                    trend="92.4% verification rate"
                    color="bg-emerald-50"
                />
                <KPICard 
                    title="Active Profiles" 
                    value={overview?.profilesWithData || 0} 
                    icon={<Briefcase className="text-amber-600" />}
                    trend="840 updates this month"
                    color="bg-amber-50"
                />
                <KPICard 
                    title="Mentors Available" 
                    value={overview?.mentorshipAvailable || 0} 
                    icon={<GraduationCap className="text-purple-600" />}
                    trend="42 new mentor signups"
                    color="bg-purple-50"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Industry Distribution */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm"
                >
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-indigo-600 rounded-full" /> Industry Distribution
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={careerStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {careerStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Placement Trends */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm"
                >
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" /> Career Growth Trends
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={careerStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Section: Top Companies & Geography */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Building2 size={20} className="text-indigo-600" /> Top Hiring Partners
                    </h3>
                    <div className="space-y-4">
                        <PartnerRow name="Google" count={42} logo="https://www.google.com/favicon.ico" />
                        <PartnerRow name="Microsoft" count={38} logo="https://www.microsoft.com/favicon.ico" />
                        <PartnerRow name="Amazon" count={35} logo="https://www.amazon.com/favicon.ico" />
                        <PartnerRow name="TCS" count={31} logo="https://www.tcs.com/favicon.ico" />
                        <PartnerRow name="Accenture" count={28} logo="https://www.accenture.com/favicon.ico" />
                    </div>
                </div>

                <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-2">Global Alumni Presence</h3>
                        <p className="text-slate-400 font-medium mb-8">Our graduates are making impact across 24 countries.</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <StatCircle label="India" value="72%" color="border-indigo-500" />
                            <StatCircle label="USA" value="15%" color="border-emerald-500" />
                            <StatCircle label="UK" value="8%" color="border-amber-500" />
                            <StatCircle label="Germany" value="5%" color="border-purple-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, icon, trend, color }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between"
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`p-4 rounded-2xl ${color}`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Real-time</span>
        </div>
        <div>
            <h4 className="text-sm font-bold text-slate-500 mb-1">{title}</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{value}</span>
                <span className="text-xs font-bold text-emerald-500">{trend.split(' ')[0]}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">{trend}</p>
        </div>
    </motion.div>
);

const PartnerRow = ({ name, count, logo }) => (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-slate-100">
        <div className="flex items-center gap-3">
            <img src={logo} alt={name} className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-slate-700">{name}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm font-black text-indigo-600">{count}</span>
            <span className="text-[10px] font-bold text-slate-400">ALUMNI</span>
        </div>
    </div>
);

const StatCircle = ({ label, value, color }) => (
    <div className="text-center space-y-3">
        <div className={`w-20 h-20 mx-auto rounded-full border-4 ${color} flex items-center justify-center text-xl font-black`}>
            {value}
        </div>
        <span className="text-sm font-bold text-slate-400">{label}</span>
    </div>
);

export default AlumniAnalytics;
