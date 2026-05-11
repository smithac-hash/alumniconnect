import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AlumniDirectory = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [domain, setDomain] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchProfiles();
    }, [domain]);

    const fetchProfiles = async () => {
        if (!user?.token) return;
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get(`http://localhost:5000/api/alumni?domain=${domain}&search=${search}`, config);
            setProfiles(data);
        } catch (error) {
            console.error('Failed to fetch profiles');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Alumni Directory</h1>
                    <p className="text-slate-500">Connect with seniors and industry experts</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-grow max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Search by name or role..."
                            className="input-field pl-12 h-12"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchProfiles()}
                        />
                    </div>
                    
                    <select 
                        className="input-field w-auto h-12 bg-white"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                    >
                        <option value="">All Domains</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Product Management">Product Management</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : profiles.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium">No alumni found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {profiles.map((profile, i) => (
                        <motion.div 
                            key={profile._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card overflow-hidden group"
                        >
                            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                                <div className="absolute -bottom-10 left-6 w-20 h-20 bg-white rounded-2xl border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-2xl">
                                        {profile.user.name.charAt(0)}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 pt-12">
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{profile.user.name}</h3>
                                <p className="text-blue-600 font-semibold text-sm mb-4">{profile.role} @ {profile.company}</p>
                                
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                                        <Briefcase className="w-4 h-4" />
                                        <span>{profile.experience} years experience</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        <span>Graduated: {profile.graduationYear}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {profile.skills.slice(0, 3).map((skill, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] uppercase tracking-wider font-bold rounded-full">
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                {/* Contact options removed */}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AlumniDirectory;
