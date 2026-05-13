import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    MapPin, 
    Briefcase, 
    ArrowLeft, 
    Award, 
    Loader2, 
    Globe, 
    Linkedin, 
    Github, 
    Users, 
    CheckCircle, 
    Calendar, 
    MessageSquare,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AlumniProfileView = () => {
    const { userId } = useParams();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`http://localhost:5000/api/alumni/profile/${userId}`, config);
                setProfile(data);
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchProfile();
    }, [userId, token]);

    const handleConnect = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/connections/request', { receiverId: userId }, config);
            alert('Connection request sent!');
        } catch (error) {
            alert('Request failed');
        }
    };

    const handleMessage = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('http://localhost:5000/api/chat/conversation', { recipientId: userId }, config);
            navigate('/messaging');
        } catch (error) {
            alert('Failed to start conversation');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        </div>
    );

    if (!profile) return (
        <div className="flex justify-center items-center h-screen bg-slate-50 text-slate-500 flex-col">
            <h2 className="text-2xl font-black mb-4 text-slate-900">Profile Not Found</h2>
            <Link to="/" className="text-indigo-600 hover:underline flex items-center gap-2 font-bold">
                <ArrowLeft className="w-4 h-4" /> Go Back
            </Link>
        </div>
    );

    const { user: alumniUser, company, role, experience, skills, graduationYear, domain, achievements, linkedin, githubUrl, portfolioUrl, bio, profilePhoto, coverPhoto, workExperience, education, mentorship } = profile;
    const avatarUrl = profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(alumniUser.name)}&background=6366f1&color=fff&size=200`;

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-20">
            <div className="max-w-6xl mx-auto px-4 pt-12">
                <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 font-bold transition-all group">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-indigo-500 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    Back to Directory
                </button>

                <div className="space-y-8">
                    {/* Header Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
                        <div className="h-64 bg-indigo-600 relative overflow-hidden">
                            <img src={coverPhoto || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1200"} className="w-full h-full object-cover opacity-60" alt="Cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        
                        <div className="px-10 pb-10 relative">
                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                <div className="-mt-24 relative z-10 p-2 bg-white rounded-[2.5rem] shadow-2xl">
                                    <img src={avatarUrl} alt={alumniUser.name} className="w-44 h-44 rounded-[2rem] object-cover" />
                                    {alumniUser.isVerified && (
                                        <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-lg">
                                            <CheckCircle className="w-8 h-8 text-emerald-500 fill-emerald-50" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 pt-6">
                                    <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{alumniUser.name}</h1>
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Class of {graduationYear}</span>
                                            </div>
                                            <p className="text-xl text-slate-600 font-bold mb-4">{role} at {company}</p>
                                            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
                                                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-indigo-400" /> {domain}</span>
                                                <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-emerald-400" /> {experience} Years Exp.</span>
                                                <span className="flex items-center gap-1.5"><Users size={16} className="text-amber-400" /> 240 Connections</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <button 
                                                onClick={handleMessage}
                                                className="btn-secondary px-8 h-14 flex items-center gap-2 rounded-2xl border-slate-200"
                                            >
                                                <MessageSquare size={20} /> Message
                                            </button>
                                            <button 
                                                onClick={handleConnect}
                                                className="btn-primary px-10 h-14 flex items-center gap-2 rounded-2xl shadow-indigo-500/20 shadow-2xl"
                                            >
                                                <Users size={20} /> Connect
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Bio */}
                            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full" /> Professional Summary
                                </h2>
                                <p className="text-slate-600 leading-relaxed font-medium text-lg italic">"{bio || "No bio available."}"</p>
                            </section>

                            {/* Career Journey */}
                            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" /> Career Journey
                                </h2>
                                <div className="space-y-10 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                                    {workExperience && workExperience.length > 0 ? (
                                        workExperience.map((exp, idx) => (
                                            <div key={idx} className="relative pl-16 group">
                                                <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-white border-4 border-indigo-600 group-hover:scale-125 transition-transform" />
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-black text-slate-900">{exp.role}</h3>
                                                    <p className="text-indigo-600 font-bold">{exp.company} • {exp.location}</p>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest pt-1">
                                                        {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                                                        {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                                                    </p>
                                                    <p className="text-slate-500 font-medium text-sm mt-3 leading-relaxed">{exp.description}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center gap-6 pl-16">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                                <Briefcase size={24} />
                                            </div>
                                            <p className="text-slate-400 font-medium italic">Current role: {role} at {company}</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Achievements */}
                            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-amber-500 rounded-full" /> Honors & Achievements
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {achievements && typeof achievements === 'string' ? (
                                        <div className="col-span-2 bg-amber-50/50 p-6 rounded-3xl border border-amber-100/50 flex gap-4">
                                            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                                                <Award size={24} />
                                            </div>
                                            <p className="text-amber-900/80 font-medium whitespace-pre-line leading-relaxed italic">{achievements}</p>
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 font-medium italic col-span-2">No achievements listed yet.</p>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar Content */}
                        <div className="space-y-8">
                            {/* Mentorship Card */}
                            {mentorship?.isAvailable && (
                                <section className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-600/20">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                        <Users size={30} />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2">Available to Mentor</h3>
                                    <p className="text-indigo-100 font-medium mb-6 leading-relaxed">
                                        I am passionate about helping the next generation of {domain} professionals.
                                    </p>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-2xl border border-white/10">
                                            <CheckCircle size={18} className="text-indigo-300" /> Career Guidance
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-2xl border border-white/10">
                                            <CheckCircle size={18} className="text-indigo-300" /> Mock Interviews
                                        </div>
                                    </div>
                                    <button className="w-full h-14 bg-white text-indigo-600 rounded-2xl font-black hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-lg">
                                        Request Mentorship <ChevronRight size={20} />
                                    </button>
                                </section>
                            )}

                            {/* Skills */}
                            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                <h2 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full" /> Skills
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill, index) => (
                                        <span key={index} className="px-4 py-2 bg-slate-50 border border-slate-100 text-slate-600 text-xs rounded-xl font-bold hover:bg-white hover:border-indigo-500 hover:text-indigo-600 transition-all cursor-default">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            {/* Social Presence */}
                            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                <h2 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" /> Presence
                                </h2>
                                <div className="space-y-3">
                                    {linkedin && (
                                        <a href={linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all font-bold text-sm">
                                            <Linkedin size={20} className="text-indigo-600" /> LinkedIn Profile
                                        </a>
                                    )}
                                    {githubUrl && (
                                        <a href={githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-slate-900 hover:text-white transition-all font-bold text-sm text-slate-600">
                                            <Github size={20} /> GitHub Portfolio
                                        </a>
                                    )}
                                    {portfolioUrl && (
                                        <a href={portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all font-bold text-sm text-slate-600">
                                            <Globe size={20} className="text-emerald-500" /> Website
                                        </a>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlumniProfileView;
