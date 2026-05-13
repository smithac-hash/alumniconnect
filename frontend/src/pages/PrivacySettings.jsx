import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Shield, 
    Mail, 
    MessageSquare, 
    Users, 
    Eye, 
    Save,
    Lock,
    CheckCircle,
    AlertCircle,
    EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PrivacySettings = () => {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error'
    const [settings, setSettings] = useState({
        showEmail: false,
        openForMentorship: true,
        showJourney: true,
        // Alumni-specific
        isPrivate: false,
        allowStudentMessages: true,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                if (user.role === 'alumni') {
                    const { data } = await axios.get(`http://localhost:5000/api/alumni/profile/${user._id}`, config);
                    if (data?.settings) {
                        setSettings(prev => ({
                            ...prev,
                            isPrivate: data.settings.isPrivate ?? false,
                            allowStudentMessages: data.settings.allowStudentMessages ?? true,
                        }));
                    }
                }
            } catch (err) {
                // Profile may not exist yet — that's fine
            }
        };
        fetchSettings();
    }, [user, token]);

    const handleSave = async () => {
        setLoading(true);
        setSaveStatus(null);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Save general settings to user model
            await axios.put('http://localhost:5000/api/auth/profile/privacy', {
                privacySettings: {
                    showEmail: settings.showEmail,
                    openForMentorship: settings.openForMentorship,
                    showJourney: settings.showJourney
                }
            }, config);

            // Save alumni-specific settings to profile
            if (user.role === 'alumni') {
                await axios.put('http://localhost:5000/api/alumni/profile/settings', {
                    isPrivate: settings.isPrivate,
                    allowStudentMessages: settings.allowStudentMessages
                }, config);
            }

            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            setSaveStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const SettingToggle = ({ icon: Icon, title, description, field, accentColor = 'indigo' }) => {
        const colorMap = {
            indigo: 'bg-indigo-50 text-indigo-500',
            rose: 'bg-rose-50 text-rose-500',
            amber: 'bg-amber-50 text-amber-500',
            emerald: 'bg-emerald-50 text-emerald-500',
        };
        return (
            <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-4 flex-1 min-w-0 mr-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[accentColor] || colorMap.indigo}`}>
                        <Icon size={24} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-slate-900">{title}</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings[field]}
                        onChange={(e) => setSettings(prev => ({ ...prev, [field]: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>
        );
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Shield size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Settings</h1>
                    <p className="text-slate-500 font-medium">Control who can see your info and interact with you.</p>
                </div>
            </div>

            {/* Alumni-specific: Private Mode */}
            {user.role === 'alumni' && (
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <EyeOff size={16} /> Profile Mode
                    </h2>
                    <SettingToggle 
                        icon={EyeOff}
                        title="Private Profile"
                        description="When enabled, other users can only see your name and company — your full career details stay hidden."
                        field="isPrivate"
                        accentColor="rose"
                    />
                    <SettingToggle 
                        icon={MessageSquare}
                        title="Allow Student Messages"
                        description="When disabled, students will not be able to find you in messaging search or contact you directly."
                        field="allowStudentMessages"
                        accentColor="amber"
                    />
                </div>
            )}

            <div className="space-y-4">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Eye size={16} /> Profile Visibility
                </h2>
                <SettingToggle 
                    icon={Mail} 
                    title="Public Email" 
                    description="Allow other users to see your email address on your profile." 
                    field="showEmail"
                />
                <SettingToggle 
                    icon={Lock} 
                    title="Show Career Journey" 
                    description="Make your professional timeline and achievements visible to the network." 
                    field="showJourney"
                />
            </div>

            <div className="space-y-4 pt-4">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Users size={16} /> Interaction Preferences
                </h2>
                <SettingToggle 
                    icon={Users} 
                    title="Open to Mentorship" 
                    description="Allow users to discover you as a mentor and send mentorship requests." 
                    field="openForMentorship"
                    accentColor="emerald"
                />
            </div>

            <div className="pt-8 flex items-center justify-between">
                <div>
                    {saveStatus === 'success' && (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold animate-in fade-in">
                            <CheckCircle size={20} /> Settings saved successfully!
                        </div>
                    )}
                    {saveStatus === 'error' && (
                        <div className="flex items-center gap-2 text-rose-600 font-bold">
                            <AlertCircle size={20} /> Failed to save. Please ensure your alumni profile is set up first.
                        </div>
                    )}
                </div>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="btn-primary px-8 h-12 flex items-center gap-2 shadow-indigo-500/20 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : <><Save size={20} /> Save Preferences</>}
                </button>
            </div>
        </div>
    );
};

export default PrivacySettings;
