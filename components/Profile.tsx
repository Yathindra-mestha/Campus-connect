import React from 'react';
import { motion } from 'framer-motion';
import {
    Github,
    Linkedin,
    Twitter,
    Star,
    Trophy,
    MapPin,
    Link as LinkIcon,
    Calendar,
    ExternalLink,
    Award,
    BookOpen,
    Camera,
    Upload,
    Trash2,
    Pencil
} from 'lucide-react';
import { githubService } from '../utils/github';
import { optimizeImage } from '../utils/imageOptimization';

interface ProfileProps {
    currentUser: {
        login: string;
        avatar_url: string;
        name?: string;
        bio?: string;
        location?: string;
        blog?: string;
    } | null;
    targetUser?: {
        login: string;
        avatar_url: string;
        name?: string;
        bio?: string;
        location?: string;
        blog?: string;
        branch?: string;
        cover_url?: string;
    } | null;
    addToast: (type: 'success' | 'error' | 'info', message: string) => void;
    profileBackground: 'default' | 'landscape';
}

const Profile: React.FC<ProfileProps> = ({ currentUser, targetUser, addToast, profileBackground }) => {
    const isOwnProfile = false; // Disable own profile logic as we have no currentUser anymore
    const displayUser = targetUser || currentUser;

    // Initialize profile metadata state. Use null/empty during loading of another user's profile
    // to strictly prevent showing the logged-in user's bio temporarily.
    const [profileData, setProfileData] = React.useState({
        name: isOwnProfile ? (currentUser?.name || '') : ((targetUser as any)?.name || ''),
        bio: isOwnProfile ? (currentUser?.bio || '') : ((targetUser as any)?.bio || ''),
        location: isOwnProfile ? (currentUser?.location || '') : ((targetUser as any)?.location || ''),
        branch: (displayUser as any)?.branch || 'Senior Innovator • CSE',
        cover_url: (displayUser as any)?.cover_url || ''
    });
    const [realStats, setRealStats] = React.useState<any>(null);

    // Update state when displayUser changes
    React.useEffect(() => {
        const fetchData = async () => {
            if (!displayUser) return;

            // Default data from displayUser
            const defaultData = {
                name: displayUser.name || '',
                bio: displayUser.bio || '',
                location: displayUser.location || '',
                branch: (displayUser as any)?.branch || 'Senior Innovator • CSE',
                cover_url: ''
            };

            try {
                const token = localStorage.getItem('github_token');
                const path = `src/content/students/${displayUser.login}/index.md`;
                const res = await fetch(`https://api.github.com/repos/Yathindra-mestha/Campus_connect/contents/${path}?t=${Date.now()}`, {
                    headers: token ? {
                        Authorization: `token ${token}`,
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    } : {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    },
                    cache: 'no-store'
                });

                if (res.ok) {
                    const json = await res.json();
                    const content = decodeURIComponent(escape(atob(json.content)));
                    const nMatch = content.match(/name:\s*"(.*)"/);
                    const bMatch = content.match(/branch:\s*"(.*)"/);
                    const bioMatch = content.match(/bio:\s*"(.*)"/);
                    const locMatch = content.match(/location:\s*"(.*)"/);
                    const coverMatch = content.match(/cover_url:\s*"(.*)"/);

                    setProfileData({
                        name: nMatch ? nMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : defaultData.name,
                        branch: bMatch ? bMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : defaultData.branch,
                        bio: bioMatch ? bioMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : defaultData.bio,
                        location: locMatch ? locMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : defaultData.location,
                        cover_url: coverMatch ? coverMatch[1] : (displayUser as any).cover_url || ''
                    });
                } else {
                    setProfileData(defaultData);
                }

                // Fetch rankings
                const leaderboard = await githubService.getLeaderboard();
                const userEntry = leaderboard.find(u => u.login === displayUser.login);
                if (userEntry) {
                    setRealStats(userEntry);
                }
            } catch (e) {
                console.error('Failed to fetch profile/rankings', e);
                setProfileData(defaultData);
            }
        };

        fetchData();
    }, [displayUser?.login, currentUser?.login]);

    if (!displayUser) return null;

    const stats = [
        { label: 'Projects', value: realStats?.projects || '0', icon: BookOpen, color: 'text-blue-500' },
        { label: 'Points', value: realStats?.points?.toLocaleString() || '1,000', icon: Trophy, color: 'text-indigo-500' },
        { label: 'Rank', value: `#${realStats?.rank || '?'}`, icon: Award, color: 'text-emerald-500' },
    ];

    return (
        <div className="min-h-screen pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Profile Header */}
            <div className="relative mb-12">
                {/* Cover Pattern or Image */}
                <div className={`h-48 w-full rounded-3xl border transition-all duration-500 overflow-hidden relative group ${profileBackground === 'landscape' ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-600 border-none' : 'bg-indigo-600/10 dark:bg-indigo-500/5 border-indigo-100 dark:border-white/5'}`}>
                    {profileBackground === 'landscape' && !profileData.cover_url && (
                        <div className="absolute inset-0 opacity-40">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                    )}
                    {profileData.cover_url ? (
                        <img
                            src={optimizeImage(profileData.cover_url, { width: 1200, quality: 85 })}
                            alt="Cover"
                            className="w-full h-[32rem] object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                        />
                    ) : profileBackground === 'default' ? (
                        <>
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e520_1px,transparent_1px),linear-gradient(to_bottom,#4f46e520_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full"></div>
                        </>
                    ) : null}


                </div>

                {/* User Info Avatar Row */}
                <div className="flex flex-col md:flex-row items-end gap-6 -mt-20 px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-40 h-40 rounded-full p-2 bg-white dark:bg-zinc-900 shadow-2xl relative group shrink-0"
                    >
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-zinc-900 shadow-inner relative">
                            <img
                                src={optimizeImage(displayUser.avatar_url, { width: 160 })}
                                alt="Profile"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-105"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    </motion.div>

                    <div className="flex-1 pb-2">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{profileData.name || displayUser.name || displayUser.login}</h1>
                            <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-widest uppercase">{profileData.branch}</p>
                        </motion.div>
                    </div>

                    <div className="flex gap-3 pb-2">
                        <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-indigo-600 transition-all">
                            <ExternalLink className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left column - About & Info */}
                <div className="space-y-8">
                    <section className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">About</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                            {profileData.bio || displayUser.bio || "Passionate about building scalable applications and contributing to open-source communities."}
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                <MapPin className="w-4 h-4 text-indigo-500" />
                                <span>{profileData.location || displayUser?.location || "Remote / Global"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                <LinkIcon className="w-4 h-4 text-indigo-500" />
                                <a
                                    href={displayUser?.blog ? (displayUser.blog.startsWith('http') ? displayUser.blog : `https://${displayUser.blog}`) : `https://github.com/${displayUser?.login}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-indigo-600 transition-colors truncate max-w-[200px]"
                                >
                                    {displayUser?.blog || `github.com/${displayUser?.login}`}
                                </a>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                <Calendar className="w-4 h-4 text-indigo-500" />
                                <span>Joined February 2024</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Social Links</h4>
                            <div className="flex gap-4">
                                <Github className="w-5 h-5 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors" />
                                <Linkedin className="w-5 h-5 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors" />
                                <Twitter className="w-5 h-5 text-slate-400 hover:text-sky-500 cursor-pointer transition-colors" />
                            </div>
                        </div>
                    </section>

                    <section className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl">
                        <Award className="w-10 h-10 mb-4 opacity-80" />
                        <h3 className="text-xl font-bold mb-2">Platform Rank</h3>
                        <p className="text-indigo-100/80 text-sm mb-6">
                            {realStats?.rank <= 3 ? "Top Contributor! 🏆" : `Ranked #${realStats?.rank || '?'} globally.`}
                        </p>
                        <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="absolute inset-y-0 left-0 bg-white rounded-full" style={{ width: `${Math.min(100, (realStats?.points || 1000) / 50)}%` }}></div>
                        </div>
                        <p className="text-[10px] font-bold mt-2 text-indigo-100/60 uppercase tracking-widest">
                            {realStats?.points || 1000} Points accumulated
                        </p>
                    </section>
                </div>

                {/* Right column - Stats & Projects */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm text-center group hover:border-indigo-500 transition-all"
                            >
                                <div className={`w-10 h-10 mx-auto rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Active Projects</h3>
                            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View Gallery</button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="group bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                                    <div className="h-48 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-slate-200 dark:bg-zinc-800 animate-pulse" />
                                        <img src={optimizeImage(`https://picsum.photos/seed/${i + 50}/600/400`, { width: 600 })} alt="Project" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" loading="lazy" decoding="async" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4"></div>
                                    </div>
                                    <div className="p-6">
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Campus Marketplace App</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-4">A peer-to-peer marketplace for students to buy and sell textbooks and equipment.</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-600 dark:text-slate-400">React Native</span>
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-600 dark:text-slate-400">Firebase</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div >
    );
};

export default Profile;
