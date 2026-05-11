import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Briefcase, Plus, Edit3, Save, Loader2, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';

const AlumniDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        company: '',
        role: '',
        experience: '',
        skills: '',
        graduationYear: '',
        domain: '',
        linkedin: '',
        bio: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get(`http://localhost:5000/api/alumni/profile/${user._id}`, config);
            if (data) {
                setProfile({
                    ...data,
                    skills: data.skills.join(', ')
                });
            }
        } catch (error) {
            console.log('Profile not set yet');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const formattedData = {
                ...profile,
                skills: profile.skills.split(',').map(s => s.trim())
            };
            await axios.post('http://localhost:5000/api/alumni/profile', formattedData, config);
            alert('Profile updated successfully!');
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <header className="mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">My Profile</h1>
                    <p className="text-slate-500">Manage your professional information</p>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-12">
                <div className="space-y-8">
                    <div className="glass-card p-10 text-center">
                        <div className="w-32 h-32 bg-slate-100 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-slate-400">
                            {user?.name.charAt(0)}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{user?.name}</h2>
                        <p className="text-slate-500 mb-6">{user?.email}</p>
                        <div className="flex justify-center gap-4">
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase">
                                {user?.role}
                            </span>
                        </div>
                    </div>

                    <div className="glass-card p-8">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                            Active Postings
                        </h3>
                        <div className="space-y-4">
                            <p className="text-slate-500 text-sm italic text-center py-4">
                                You haven't posted any jobs or events yet.
                            </p>
                            <button className="w-full btn-secondary text-sm flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create New Post
                            </button>
                        </div>
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 glass-card p-10"
                >
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Company</label>
                                <input 
                                    className="input-field"
                                    value={profile.company}
                                    onChange={(e) => setProfile({...profile, company: e.target.value})}
                                    placeholder="Microsoft"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Role</label>
                                <input 
                                    className="input-field"
                                    value={profile.role}
                                    onChange={(e) => setProfile({...profile, role: e.target.value})}
                                    placeholder="Software Engineer"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Years of Experience</label>
                                <input 
                                    type="number"
                                    className="input-field"
                                    value={profile.experience}
                                    onChange={(e) => setProfile({...profile, experience: e.target.value})}
                                    placeholder="5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Domain</label>
                                <select 
                                    className="input-field bg-white"
                                    value={profile.domain}
                                    onChange={(e) => setProfile({...profile, domain: e.target.value})}
                                >
                                    <option value="">Select Domain</option>
                                    <option>Software Engineering</option>
                                    <option>Data Science</option>
                                    <option>Design</option>
                                    <option>Product Management</option>
                                </select>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-sm font-bold text-slate-700">Skills (comma separated)</label>
                                <input 
                                    className="input-field"
                                    value={profile.skills}
                                    onChange={(e) => setProfile({...profile, skills: e.target.value})}
                                    placeholder="React, Node.js, AWS"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Graduation Year</label>
                                <input 
                                    type="number"
                                    className="input-field"
                                    value={profile.graduationYear}
                                    onChange={(e) => setProfile({...profile, graduationYear: e.target.value})}
                                    placeholder="2018"
                                />
                            </div>
                             {/* LinkedIn profile option removed */}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Bio</label>
                            <textarea 
                                className="input-field min-h-[120px] pt-3"
                                value={profile.bio}
                                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-primary w-full h-14 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AlumniDashboard;
