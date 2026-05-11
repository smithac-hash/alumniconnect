import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Calendar, MessageSquare, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ jobs: 0 });
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [eventsCount, setEventsCount] = useState(0);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(true);

    const fetchUpcomingEvents = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/events/upcoming', config);
            setUpcomingEvents(data.events);
            setEventsCount(data.count);
        } catch (error) {
            console.error('Failed to fetch upcoming events:', error);
        } finally {
            setLoadingEvents(false);
        }
    };

    const fetchRecommendedJobs = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/jobs/recommended', config);
            setRecommendedJobs(data);
            setStats(prev => ({ ...prev, jobs: data.length }));
        } catch (error) {
            console.error('Failed to fetch recommended jobs:', error);
        } finally {
            setLoadingJobs(false);
        }
    };

    const fetchAchievements = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/posts', config);
            setAchievements(data);
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
        }
    };

    useEffect(() => {
        if (user && user.token) {
            fetchUpcomingEvents();
            fetchRecommendedJobs();
            fetchAchievements();

            const socket = io('http://localhost:5000');
            socket.on('new_notification', (data) => {
                if (data.type === 'event') {
                    fetchUpcomingEvents();
                }
            });

            socket.on('new_job', () => {
                fetchRecommendedJobs();
            });

            return () => socket.close();
        }
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <header className="mb-12">
                <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-bold text-slate-900 mb-2"
                >
                    Hello, {user?.name.split(' ')[0]} 👋
                </motion.h1>
                <p className="text-slate-500">Welcome back to your personalized dashboard.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: 'Active Jobs', value: stats.jobs, icon: <Briefcase className="text-blue-600" />, color: 'bg-blue-50' },
                    { label: 'Upcoming Events', value: eventsCount, icon: <Calendar className="text-purple-600" />, color: 'bg-purple-50' },
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 flex items-center gap-6"
                    >
                        <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center`}>
                            {React.cloneElement(stat.icon, { className: 'w-7 h-7' })}
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10">
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Recommended Jobs</h2>
                            <Link to="/jobs" className="text-blue-600 font-semibold text-sm flex items-center gap-1 hover:underline">
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {loadingJobs ? (
                                [1, 2].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)
                            ) : recommendedJobs.length === 0 ? (
                                <div className="p-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-500 font-medium">No job recommendations available currently.</p>
                                </div>
                            ) : (
                                recommendedJobs.map((job) => (
                                    <div key={job._id} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                                                <img 
                                                    src={job.alumniProfile?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=f1f5f9&color=64748b&bold=true`} 
                                                    alt={job.company}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-slate-500 text-sm">{job.company}</p>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                    <p className="text-blue-600 text-xs font-bold">{job.type}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Link 
                                            to="/jobs"
                                            className="px-5 py-2.5 text-blue-600 bg-blue-50 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            Details
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Recent Achievements</h2>
                        </div>
                        <div className="space-y-6">
                            {achievements.length === 0 ? (
                                <div className="p-8 glass-card border-none bg-gradient-to-br from-indigo-600 to-blue-700 text-white text-center">
                                    <p className="text-blue-100 font-medium">No recent achievements posted.</p>
                                </div>
                            ) : (
                                achievements.map((post) => (
                                    <div key={post._id} className="p-8 glass-card border-none bg-gradient-to-br from-indigo-600 to-blue-700 text-white relative group">
                                        <h3 className="text-xl font-bold mb-3">{post.title}</h3>
                                        <p className="text-blue-100 mb-6 leading-relaxed">
                                            {post.content}
                                        </p>
                                        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                                            <Link to={`/alumni/${post.author?._id}`}>
                                                <img 
                                                    src={post.alumniProfile?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'Alumni')}&background=fff&color=2563eb`} 
                                                    alt={post.author?.name}
                                                    className="w-10 h-10 rounded-full border-2 border-white/30 hover:border-white transition-colors object-cover"
                                                />
                                            </Link>
                                            <div>
                                                <p className="text-xs text-blue-200">Posted by</p>
                                                <Link to={`/alumni/${post.author?._id}`} className="font-medium hover:text-white transition-colors">
                                                    {post.author?.name}
                                                </Link>
                                                {post.alumniProfile && (
                                                    <span className="text-xs text-blue-200 ml-2">
                                                        • {post.alumniProfile.role} at {post.alumniProfile.company}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-10">
                    <section className="glass-card p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Upcoming Sessions</h2>
                        <div className="space-y-6">
                            {loadingEvents ? (
                                <div className="flex justify-center items-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                </div>
                            ) : upcomingEvents.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-slate-500 font-medium text-sm">No Upcoming Events Available</p>
                                </div>
                            ) : (
                                upcomingEvents.slice(0, 3).map((event, i) => {
                                    const eventDate = new Date(event.date);
                                    const month = eventDate.toLocaleString('default', { month: 'short' });
                                    const day = eventDate.getDate();

                                    return (
                                        <div key={event._id || i} className="flex gap-4">
                                            <div className="text-center">
                                                <p className="text-xs font-bold text-blue-600 uppercase">{month}</p>
                                                <p className="text-lg font-extrabold text-slate-900">{day}</p>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-900 text-sm mb-1">{event.title}</h4>
                                                
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Link to={`/alumni/${event.organizer?._id}`}>
                                                        <img 
                                                            src={event.alumniProfile?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.organizer?.name || 'Alumni')}&background=2563eb&color=fff`}
                                                            alt={event.organizer?.name}
                                                            className="w-5 h-5 rounded-full object-cover"
                                                        />
                                                    </Link>
                                                    <p className="text-slate-500 text-xs">
                                                        {event.time} • <Link to={`/alumni/${event.organizer?._id}`} className="hover:text-blue-600 font-medium">{event.organizer?.name}</Link>
                                                    </p>
                                                </div>

                                                <a 
                                                    href={event.meetingLink || '#'} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                                                >
                                                    Join / Register
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <Link to="/events" className="btn-primary w-full mt-8 flex items-center justify-center text-sm">
                            View All Events
                        </Link>
                    </section>

                    <section className="bg-slate-900 rounded-3xl p-8 text-white">
                        <h2 className="text-xl font-bold mb-4">Need Help?</h2>
                        <p className="text-slate-400 text-sm mb-6">Connect with our support team or browse the FAQ section.</p>
                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Support Chat
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
