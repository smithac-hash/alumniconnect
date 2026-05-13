import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, 
    MessageCircle, 
    Share2, 
    Image as ImageIcon, 
    Send, 
    MoreHorizontal, 
    TrendingUp,
    Award,
    Briefcase,
    Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CommunityFeed = () => {
    const { user, token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState({ title: '', content: '', type: 'general' });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState('');

    useEffect(() => {
        fetchPosts();
    }, [token]);

    const fetchPosts = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/posts', config);
            setPosts(data);
        } catch (error) {
            console.error('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.content.trim() || !newPost.title.trim()) return;

        setPosting(true);
        setPostError('');
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('http://localhost:5000/api/posts', {
                title: newPost.title.trim(),
                content: newPost.content.trim(),
                type: newPost.type
            }, config);
            setPosts([data, ...posts]);
            setNewPost({ title: '', content: '', type: 'general' });
            setShowCreateModal(false);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to post. Please try again.';
            setPostError(msg);
            console.error('Post error:', error.response?.data || error.message);
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put(`http://localhost:5000/api/posts/${postId}/like`, {}, config);
            setPosts(posts.map(p => p._id === postId ? data : p));
        } catch (error) {
            console.error('Failed to like post');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 grid lg:grid-cols-12 gap-8">
            {/* Left Sidebar - User Info */}
            <div className="lg:col-span-3 space-y-6 hidden lg:block">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="h-16 bg-gradient-to-r from-indigo-600 to-purple-600" />
                    <div className="px-4 pb-6">
                        <div className="relative -mt-8 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg">
                                <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xl">
                                    {user.name.charAt(0)}
                                </div>
                            </div>
                            <h3 className="mt-4 font-black text-slate-900">{user.name}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.role}</p>
                        </div>
                        <div className="mt-6 space-y-3 pt-6 border-t border-slate-100">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-500">Connections</span>
                                <span className="text-indigo-600 font-bold">128</span>
                            </div>
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-500">Post Views</span>
                                <span className="text-indigo-600 font-bold">1.2k</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Trending Topics</h4>
                    <div className="space-y-4">
                        {['#Placements2026', '#AlumniMeet', '#TechStack', '#StartupLife'].map(tag => (
                            <div key={tag} className="flex items-center gap-2 cursor-pointer group">
                                <TrendingUp size={14} className="text-slate-400 group-hover:text-indigo-600" />
                                <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">{tag}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-6 space-y-6">
                {/* Create Post */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500 text-sm font-medium text-left px-4 rounded-xl border border-slate-100 transition-all"
                        >
                            Share an achievement or update...
                        </button>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-6">
                        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all">
                            <ImageIcon size={18} className="text-indigo-500" /> Photo
                        </button>
                        <button onClick={() => { setNewPost({...newPost, type: 'job'}); setShowCreateModal(true); }} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-all">
                            <Briefcase size={18} className="text-emerald-500" /> Job Update
                        </button>
                        <button onClick={() => { setNewPost({...newPost, type: 'achievement'}); setShowCreateModal(true); }} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-500 transition-all">
                            <Award size={18} className="text-amber-500" /> Milestone
                        </button>
                    </div>
                </div>

                {/* Create Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowCreateModal(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative z-10"
                            >
                                <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Create Post</h3>
                                <form onSubmit={handleCreatePost} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                        <input 
                                            required
                                            className="input-field h-12"
                                            placeholder="Catchy headline..."
                                            value={newPost.title}
                                            onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content</label>
                                        <textarea 
                                            required
                                            className="input-field min-h-[150px] py-4"
                                            placeholder="What's on your mind?"
                                            value={newPost.content}
                                            onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <select 
                                            className="bg-slate-100 border-none rounded-xl px-4 h-12 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/20"
                                            value={newPost.type}
                                            onChange={(e) => setNewPost({...newPost, type: e.target.value})}
                                        >
                                            <option value="general">General Update</option>
                                            <option value="achievement">Achievement 🏆</option>
                                            <option value="career_update">Career Update 💼</option>
                                        </select>
                                        <button
                                            type="submit"
                                            disabled={posting}
                                            className="flex-1 btn-primary h-12 shadow-indigo-500/20 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {posting ? (
                                                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Posting...</>
                                            ) : 'Post to Feed'}
                                        </button>
                                    </div>
                                    {postError && (
                                        <p className="text-sm font-bold text-rose-500 bg-rose-50 px-4 py-3 rounded-xl">
                                            ⚠️ {postError}
                                        </p>
                                    )}
                                </form>
                                <button 
                                    onClick={() => setShowCreateModal(false)}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 transition-all"
                                >
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Posts List */}
                {loading ? (
                    [1,2,3].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                                <div className="space-y-2">
                                    <div className="h-3 w-32 bg-slate-100 rounded-full" />
                                    <div className="h-2 w-20 bg-slate-100 rounded-full" />
                                </div>
                            </div>
                            <div className="h-4 w-3/4 bg-slate-100 rounded-full" />
                            <div className="h-3 w-full bg-slate-100 rounded-full" />
                            <div className="h-3 w-5/6 bg-slate-100 rounded-full" />
                        </div>
                    ))
                ) : posts.length === 0 ? (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
                            <TrendingUp size={32} />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-2">No posts yet</h3>
                        <p className="text-slate-500 text-sm font-medium mb-6">Be the first to share an achievement or update!</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary px-6 h-11"
                        >
                            Create First Post
                        </button>
                    </div>
                ) : (
                <AnimatePresence>
                    {posts.map((post) => {
                        const typeLabel = {
                            achievement: '🏆 Achievement',
                            career_update: '💼 Career Update',
                            general: '📝 Update'
                        }[post.type] || '📝 Update';

                        return (
                        <motion.div 
                            key={post._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                        >
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                        {post.author?.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">{post.author?.name}</h4>
                                        <p className="text-[10px] text-slate-500 font-medium">
                                            {typeLabel} • {new Date(post.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <div className="px-4 pb-4 space-y-4">
                                <h3 className="font-black text-slate-900 leading-tight">{post.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{post.content}</p>
                                {post.image && (
                                    <img src={post.image} className="w-full rounded-xl border border-slate-100" alt="Post" />
                                )}
                            </div>

                            <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => handleLike(post._id)}
                                        className={`flex items-center gap-1.5 text-xs font-bold transition-all
                                            ${post.likes?.includes(user._id) ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'}`}
                                    >
                                        <Heart size={18} fill={post.likes?.includes(user._id) ? 'currentColor' : 'none'} />
                                        {post.likes?.length || 0}
                                    </button>
                                    <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all">
                                        <MessageCircle size={18} />
                                        {post.comments?.length || 0}
                                    </button>
                                </div>
                                <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all">
                                    <Share2 size={18} /> Share
                                </button>
                            </div>
                        </motion.div>
                        );
                    })}
                </AnimatePresence>
                )}
            </div>

            {/* Right Sidebar - Suggestions */}
            <div className="lg:col-span-3 space-y-6 hidden lg:block">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Add to your feed</h4>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate">Alumni Name</p>
                                        <p className="text-[10px] text-slate-500 truncate">Google • SWE</p>
                                    </div>
                                </div>
                                <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                    <Plus size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
                        View all recommendations
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommunityFeed;
