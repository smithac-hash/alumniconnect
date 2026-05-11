import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Calendar, Award, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="bg-slate-50">
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-100/50 -z-10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-100/30 rounded-full blur-3xl -z-10" />
                
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight"
                    >
                        Connect with your <span className="gradient-text">Future.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Bridging the gap between students and alumni. Find mentorship, jobs, and grow your network with ease.
                    </motion.p>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/signup" className="btn-primary flex items-center gap-2 group">
                            Get Started 
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need to succeed</h2>
                    <p className="text-slate-500">Powerful tools designed for both students and alumni.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { 
                            icon: <Briefcase className="w-6 h-6 text-indigo-600" />, 
                            title: "Job Portal", 
                            desc: "Exclusive job and internship opportunities posted by alumni." 
                        },
                        { 
                            icon: <Calendar className="w-6 h-6 text-purple-600" />, 
                            title: "Live Sessions", 
                            desc: "Register for webinars and career guidance sessions." 
                        },
                        { 
                            icon: <Award className="w-6 h-6 text-emerald-600" />, 
                            title: "Achievements", 
                            desc: "Stay inspired by the success stories of your seniors." 
                        }
                    ].map((feature, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ y: -10 }}
                            className="p-8 glass-card border-none"
                        >
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-500 mb-6">{feature.desc}</p>
                            <Link to="/signup" className="text-blue-600 font-semibold flex items-center gap-1 group">
                                Learn more <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
