import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, ArrowLeft, Award, Loader2 } from 'lucide-react';

const AlumniProfileView = () => {
    const { userId } = useParams();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`http://localhost:5000/api/alumni/profile/${userId}`, config);
                setProfile(data);
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.token) {
            fetchProfile();
        }
    }, [userId, user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50 text-slate-500 flex-col">
                <h2 className="text-2xl font-bold mb-4 text-slate-900">Profile Not Found</h2>
                <Link to="/" className="text-blue-600 hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </Link>
            </div>
        );
    }

    const { user: alumniUser, company, role, experience, skills, graduationYear, domain, achievements, linkedin, bio, profilePhoto } = profile;
    const avatarUrl = profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(alumniUser.name)}&background=2563eb&color=fff&size=200`;

    return (
        <div className="bg-slate-50 min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Link to={-1} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-medium transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back
                </Link>

                <div className="glass-card overflow-hidden">
                    {/* Header Banner */}
                    <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative"></div>
                    
                    {/* Profile Info */}
                    <div className="px-8 pb-10 relative">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="-mt-20 relative z-10">
                                <img 
                                    src={avatarUrl} 
                                    alt={alumniUser.name} 
                                    className="w-40 h-40 rounded-3xl border-8 border-white shadow-xl object-cover bg-white"
                                />
                            </div>
                            
                            <div className="flex-1 pt-4">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                    <div>
                                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{alumniUser.name}</h1>
                                        <p className="text-xl text-blue-600 font-semibold">{role} at {company}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        {/* Contact options removed as per request */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-8">
                                <section>
                                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">About</h2>
                                    <p className="text-slate-600 leading-relaxed">{bio || "No bio available."}</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">Career Journey & Experience</h2>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">{role}</h3>
                                            <p className="text-blue-600 font-medium mb-2">{company}</p>
                                            <p className="text-slate-500 text-sm">{experience} years of experience in {domain}.</p>
                                        </div>
                                    </div>
                                </section>

                                {achievements && (
                                    <section>
                                        <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">Achievements</h2>
                                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4 text-indigo-900">
                                            <Award className="w-6 h-6 shrink-0 mt-1" />
                                            <p className="leading-relaxed whitespace-pre-line">{achievements}</p>
                                        </div>
                                    </section>
                                )}
                            </div>

                            <div className="space-y-8">
                                <section className="bg-slate-50 p-6 rounded-2xl">
                                    <h2 className="font-bold text-slate-900 mb-4">Quick Facts</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <MapPin className="w-5 h-5 text-slate-400" />
                                            <span>Class of {graduationYear}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Briefcase className="w-5 h-5 text-slate-400" />
                                            <span>Domain: {domain}</span>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="font-bold text-slate-900 mb-4 border-b pb-2">Skills</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlumniProfileView;
