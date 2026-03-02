import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Target, Trophy, UploadCloud,
    Edit3, ShieldAlert, ArrowRight, ExternalLink,
    X, Save, User as UserIcon, Github, Linkedin, Mail,
    MessageSquare, Trash2, Settings, Loader2
} from 'lucide-react';
import { githubService, ProjectData } from '../utils/github';
import { supabase } from '../src/lib/supabaseClient';

const Dashboard = ({ user, handleNavigate, onProfileUpdate }: { user: any; handleNavigate: (path: string) => void; onProfileUpdate?: () => void }) => {
    const [userProjects, setUserProjects] = useState<ProjectData[]>([]);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [userRank, setUserRank] = useState<{ rank: number; points: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeletingPost, setIsDeletingPost] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: user?.name || '',
        branch: user?.branch || '',
        avatar_url: user?.avatar_url || '',
        linkedin_url: user?.linkedin_url || '',
        github_url: user?.github_url || ''
    });

    useEffect(() => {
        if (user) {
            setEditData({
                name: user.name || '',
                branch: user.branch || '',
                avatar_url: user.avatar_url || '',
                linkedin_url: user.linkedin_url || '',
                github_url: user.github_url || ''
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    name: editData.name,
                    branch: editData.branch,
                    avatar_url: editData.avatar_url,
                    linkedin_url: editData.linkedin_url,
                    github_url: editData.github_url
                })
                .eq('id', user.id);

            if (error) throw error;
            setIsEditing(false);
            if (onProfileUpdate) onProfileUpdate();
        } catch (err) {
            console.error('Error updating profile:', err);
        }
    };

    const fetchUserPosts = async () => {
        if (!user?.id) return;
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('author_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUserPosts(data || []);
        } catch (err) {
            console.error('Error fetching user posts:', err);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        setIsDeletingPost(postId);
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId);

            if (error) throw error;
            setUserPosts(userPosts.filter(p => p.id !== postId));
        } catch (err) {
            console.error('Error deleting post:', err);
            alert('Failed to delete post');
        } finally {
            setIsDeletingPost(null);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const [allProjects, leaderboard] = await Promise.all([
                    githubService.getAllProjects(),
                    githubService.getLeaderboard(),
                ]);

                // Also fetch user posts
                fetchUserPosts();

                const loggedInUserLogin = user.login || user.email?.split('@')[0] || user.name?.replace(/\s+/g, '').toLowerCase();

                const myProjects = allProjects.filter(
                    (p) =>
                        p.author_login?.toLowerCase() === loggedInUserLogin?.toLowerCase() ||
                        p.author?.toLowerCase() === user.name?.toLowerCase()
                );
                setUserProjects(myProjects);

                const rankData = leaderboard.find((u: any) =>
                    u.login?.toLowerCase() === loggedInUserLogin?.toLowerCase() ||
                    u.name?.toLowerCase() === user.name?.toLowerCase()
                );

                if (rankData) {
                    setUserRank({ rank: rankData.rank, points: rankData.points });
                }

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
                <ShieldAlert className="w-20 h-20 text-indigo-500 mb-6" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Access Denied</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
                    You must be logged in to view your personalized dashboard and track your standing.
                </p>
                <button
                    onClick={() => handleNavigate('home')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                >
                    Return Home
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const stats = [
        { label: 'Total Uploads', value: userProjects.length, icon: UploadCloud, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Global Rank', value: userRank ? `#${userRank.rank}` : 'Unranked', icon: Trophy, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Total Points', value: userRank ? userRank.points : 0, icon: Target, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white dark:border-[#1e1e1e] shadow-xl">
                            <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white">Hi, {user.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your projects and profile connection.</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <a
                        href="/admin"
                        className="px-6 py-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        CMS Admin
                    </a>
                    <button
                        onClick={() => handleNavigate('members')}
                        className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        <UserIcon className="w-5 h-5" />
                        Explore Members
                    </button>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                    >
                        <Edit3 className="w-5 h-5" />
                        Edit Profile
                    </button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-sm"
                    >
                        <div className="flex items-center gap-6">
                            <div className={`p-5 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-10 h-10" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-4xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditing(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-xl bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl overflow-hidden border border-white/10"
                        >
                            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/20">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Edit Your Profile</h2>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors">
                                    <X className="w-6 h-6 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-indigo-500 uppercase tracking-widest pl-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-indigo-500 uppercase tracking-widest pl-1">Branch / Major</label>
                                        <input
                                            type="text"
                                            value={editData.branch}
                                            placeholder="e.g. CSE, Mechanical..."
                                            onChange={(e) => setEditData({ ...editData, branch: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-indigo-500 uppercase tracking-widest pl-1">Avatar URL</label>
                                    <input
                                        type="url"
                                        value={editData.avatar_url}
                                        onChange={(e) => setEditData({ ...editData, avatar_url: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[#0077b5] uppercase tracking-widest pl-1">LinkedIn Profile</label>
                                        <div className="relative">
                                            <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="url"
                                                value={editData.linkedin_url}
                                                onChange={(e) => setEditData({ ...editData, linkedin_url: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white text-sm"
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">GitHub Profile</label>
                                        <div className="relative">
                                            <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="url"
                                                value={editData.github_url}
                                                onChange={(e) => setEditData({ ...editData, github_url: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-white/5 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white text-sm"
                                                placeholder="https://github.com/..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                                    >
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-slate-200 dark:border-white/5 p-8 md:p-10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Recent Projects</h2>
                            <button
                                onClick={() => handleNavigate('projects')}
                                className="text-indigo-600 dark:text-indigo-400 hover:opacity-70 font-black flex items-center gap-2 transition-opacity"
                            >
                                View Library <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                        {userProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {userProjects.slice(0, 4).map((project, idx) => (
                                    <div key={idx} className="group relative bg-slate-50 dark:bg-white/5 rounded-2xl p-4 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer">
                                        <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-slate-200 dark:bg-white/10">
                                            {project.image ? (
                                                <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <UploadCloud className="w-8 h-8 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">{project.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{project.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-slate-50 dark:bg-black/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10">
                                <UploadCloud className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No projects uploaded</h3>
                                <button
                                    onClick={() => handleNavigate('projects')}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors mt-4"
                                >
                                    Upload First Project
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-slate-200 dark:border-white/5 p-8 md:p-10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Hub Activity</h2>
                            <button
                                onClick={() => handleNavigate('community')}
                                className="text-indigo-600 dark:text-indigo-400 hover:opacity-70 font-black flex items-center gap-2 transition-opacity"
                            >
                                Open Forum <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                        {userPosts.length > 0 ? (
                            <div className="space-y-4">
                                {userPosts.map((post) => (
                                    <div key={post.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl group border border-transparent hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{post.title}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(post.created_at).toLocaleDateString()} • {post.category}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            disabled={isDeletingPost === post.id}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            {isDeletingPost === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-slate-50 dark:bg-black/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10">
                                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No posts yet. Start a conversation!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-12">
                    {/* Contact & Links card */}
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-slate-200 dark:border-white/5 p-8 md:p-10">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8">Connection Hub</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                                <Mail className="w-5 h-5 text-indigo-500" />
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{user.email}</p>
                                </div>
                            </div>
                            {user.linkedin_url && (
                                <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-[#0077b5]/10 hover:bg-[#0077b5]/20 transition-colors group">
                                    <Linkedin className="w-5 h-5 text-[#0077b5]" />
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LinkedIn</p>
                                        <p className="font-bold text-slate-900 dark:text-white truncate text-sm uppercase">Connected Account</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 ml-auto text-slate-400" />
                                </a>
                            )}
                            {user.github_url && (
                                <a href={user.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 transition-colors group">
                                    <Github className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GitHub</p>
                                        <p className="font-bold text-slate-900 dark:text-white truncate text-sm uppercase">Source Profile</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 ml-auto text-slate-400" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
