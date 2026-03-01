import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Target, Trophy, UploadCloud, Edit3, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { githubService, ProjectData } from '../utils/github';

const Dashboard = ({ user, handleNavigate }: { user: any; handleNavigate: (path: string) => void }) => {
    const [userProjects, setUserProjects] = useState<ProjectData[]>([]);
    const [userRank, setUserRank] = useState<{ rank: number; points: number } | null>(null);
    const [loading, setLoading] = useState(true);

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
                className="mb-8"
            >
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 dark:border-white/10">
                        <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back, {user.name}</h1>
                        <p className="text-slate-600 dark:text-slate-400">Here's what's happening with your account today.</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-slate-200 dark:border-white/5 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Recent Projects</h2>
                            <button
                                onClick={() => handleNavigate('projects')}
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium flex items-center gap-1"
                            >
                                View Library <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {userProjects.length > 0 ? (
                            <div className="space-y-4">
                                {userProjects.slice(0, 3).map((project, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10 group cursor-pointer">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-white/5">
                                            {project.image ? (
                                                <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-slate-400 text-xs text-center font-medium">No Image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">{project.description}</p>
                                        </div>
                                        {project.github_url && (
                                            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                <ExternalLink className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UploadCloud className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No projects uploaded yet</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                                    Start contributing to the community by uploading your first project to CampusConnect.
                                </p>
                                <button
                                    onClick={() => handleNavigate('projects')}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                                >
                                    Upload First Project
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar / Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-slate-200 dark:border-white/5 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleNavigate('projects')}
                                className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-indigo-500/10 text-slate-700 dark:text-slate-200 transition-colors group"
                            >
                                <UploadCloud className="w-5 h-5 text-indigo-500" />
                                <span className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Submit Project</span>
                            </button>

                            <button
                                onClick={() => handleNavigate('profile')}
                                className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-indigo-500/10 text-slate-700 dark:text-slate-200 transition-colors group"
                            >
                                <Edit3 className="w-5 h-5 text-indigo-500" />
                                <span className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Edit Profile</span>
                            </button>

                            <button
                                onClick={() => window.open('/admin/index.html', '_blank')}
                                className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-indigo-500/10 text-slate-700 dark:text-slate-200 transition-colors group"
                            >
                                <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                                <span className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Manage Content (CMS)</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
