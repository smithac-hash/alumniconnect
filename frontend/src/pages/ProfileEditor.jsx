import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, 
    Globe, 
    Save, 
    Plus, 
    Trash2, 
    ChevronRight, 
    ChevronLeft,
    Award,
    Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfileEditor = () => {
    const { user, token, loading: authLoading } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        company: '',
        role: '',
        experience: 0,
        domain: '',
        skills: [],
        bio: '',
        linkedin: '',
        githubUrl: '',
        workExperience: [],
        education: [],
        mentorship: {
            isAvailable: false,
            maxStudents: 3,
            availableTimings: ''
        }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token || !user?._id) return;
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`http://localhost:5000/api/alumni/profile/${user._id}`, config);
                if (data) {
                    setProfile(prev => ({
                        ...prev,
                        ...data,
                        workExperience: data.workExperience || [],
                        education: data.education || [],
                        mentorship: { ...prev.mentorship, ...(data.mentorship || {}) },
                        skills: data.skills || []
                    }));
                }
            } catch (error) {
                console.log('No profile found or error fetching profile');
            }
        };
        fetchProfile();
    }, [user?._id, token]);

    if (authLoading) return <div className="p-20 text-center font-bold text-slate-500">Loading Session...</div>;
    if (!user) return <div className="p-20 text-center text-red-500 font-bold">Please login to continue</div>;

    const handleSave = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Strip out sensitive/internal fields before sending
            const { _id, user: userId, createdAt, updatedAt, __v, ...saveData } = profile;
            await axios.post('http://localhost:5000/api/alumni/profile', saveData, config);
            alert('Profile updated successfully!');
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 min-h-[600px]">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile Editor</h1>
                    <p className="text-slate-500 font-medium">Update your professional details.</p>
                </div>
                <div className="text-right">
                    <span className="text-sm font-bold text-slate-400 block mb-1">Step {step} of 4</span>
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${(step/4)*100}%` }}></div>
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-h-[400px]">
                <div className="p-10">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Job Title</label>
                                    <input className="input-field" value={profile.role || ''} onChange={(e) => setProfile({...profile, role: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Company</label>
                                    <input className="input-field" value={profile.company || ''} onChange={(e) => setProfile({...profile, company: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Domain</label>
                                    <input className="input-field" value={profile.domain || ''} onChange={(e) => setProfile({...profile, domain: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Years of Experience</label>
                                    <input type="number" className="input-field" value={profile.experience || 0} onChange={(e) => setProfile({...profile, experience: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Short Bio</label>
                                <textarea className="input-field min-h-[100px]" value={profile.bio || ''} onChange={(e) => setProfile({...profile, bio: e.target.value})} />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-slate-900">Work Experience</h3>
                                <button 
                                    onClick={() => setProfile({...profile, workExperience: [...profile.workExperience, { company: '', role: '', description: '' }]})}
                                    className="text-indigo-600 font-bold flex items-center gap-1"
                                >
                                    <Plus size={16} /> Add New
                                </button>
                            </div>
                            {profile.workExperience.map((work, idx) => (
                                <div key={idx} className="p-6 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4">
                                    <input 
                                        placeholder="Company" 
                                        className="input-field bg-white" 
                                        value={work.company || ''}
                                        onChange={(e) => {
                                            const newExp = [...profile.workExperience];
                                            newExp[idx].company = e.target.value;
                                            setProfile({...profile, workExperience: newExp});
                                        }}
                                    />
                                    <input 
                                        placeholder="Role" 
                                        className="input-field bg-white" 
                                        value={work.role || ''}
                                        onChange={(e) => {
                                            const newExp = [...profile.workExperience];
                                            newExp[idx].role = e.target.value;
                                            setProfile({...profile, workExperience: newExp});
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <h3 className="text-xl font-bold text-slate-900">Social Presence</h3>
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">LinkedIn Profile</label>
                                    <input className="input-field" value={profile.linkedin || ''} onChange={(e) => setProfile({...profile, linkedin: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">GitHub Profile</label>
                                    <input className="input-field" value={profile.githubUrl || ''} onChange={(e) => setProfile({...profile, githubUrl: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <h3 className="text-xl font-bold text-slate-900">Mentorship</h3>
                            <div className="flex items-center justify-between p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <div>
                                    <p className="font-bold text-indigo-900">Open for Mentorship?</p>
                                    <p className="text-sm text-indigo-700">Help students by offering guidance.</p>
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="w-6 h-6 rounded border-indigo-300"
                                    checked={profile.mentorship?.isAvailable || false}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        mentorship: { ...profile.mentorship, isAvailable: e.target.checked }
                                    })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 p-8 flex items-center justify-between border-t border-slate-100">
                    <button 
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className="flex items-center gap-2 font-bold text-slate-400 hover:text-slate-600 disabled:opacity-0"
                    >
                        <ChevronLeft size={20} /> Back
                    </button>
                    
                    {step < 4 ? (
                        <button 
                            onClick={() => setStep(s => s + 1)}
                            className="btn-primary px-8 h-12 flex items-center gap-2"
                        >
                            Continue <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSave}
                            disabled={loading}
                            className="btn-primary px-10 h-12 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                            {loading ? 'Saving...' : <><Save size={20} /> Save Profile</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileEditor;
