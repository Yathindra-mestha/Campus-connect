import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, BookOpen, ArrowRight, History, Star, TrendingUp, Loader2 } from 'lucide-react';
import { githubService, ProjectData } from '../utils/github';
import { optimizeImage } from '../utils/imageOptimization';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    setActiveSection: (section: string, slug?: string) => void;
    setSelectedUserForProfile: (user: any) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, setActiveSection, setSelectedUserForProfile }) => {
    const [query, setQuery] = useState('');
    const [people, setPeople] = useState<any[]>([]);
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'people' | 'projects' | 'online'>('all');

    const isOnline = (lastActive?: string) => {
        if (!lastActive) return false;
        const lastActiveDate = new Date(lastActive);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return lastActiveDate > fiveMinutesAgo;
    };

    const isRecentlyActive = (lastActive?: string) => {
        if (!lastActive) return false;
        const lastActiveDate = new Date(lastActive);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return lastActiveDate > oneHourAgo;
    };

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const [leaderboard, allProjects] = await Promise.all([
                        githubService.getLeaderboard(),
                        githubService.getAllProjects()
                    ]);
                    setPeople(leaderboard);
                    setProjects(allProjects);
                } catch (error) {
                    console.error('Failed to fetch search data', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
            // Lock overflow
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            setQuery('');
        }
    }, [isOpen]);

    const filteredPeople = useMemo(() => {
        let list = people;
        if (activeTab === 'online') {
            list = people.filter(p => isOnline(p.last_active_at) || isRecentlyActive(p.last_active_at));
        }
        if (!query) return list.slice(0, 3);
        return list.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.login.toLowerCase().includes(query.toLowerCase()) ||
            p.branch.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
    }, [people, query, activeTab]);

    const filteredProjects = useMemo(() => {
        if (!query) return projects.slice(0, 3);
        return projects.filter(p =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            (p.author || '').toLowerCase().includes(query.toLowerCase()) ||
            (p.tags || []).some(t => t.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 5);
    }, [projects, query]);

    const handleUserClick = (person: any) => {
        setSelectedUserForProfile(person);
        onClose();
    };

    const handleProjectClick = (slug: string) => {
        setActiveSection('projects', slug);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-2xl bg-white dark:bg-[#121212] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden relative z-10"
                    >
                        {/* Search Input Area */}
                        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Search for people, projects, or domains..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-800/50 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-12 py-4 text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                                />
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex gap-2 mt-4">
                                {(['all', 'people', 'projects', 'online'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Results Area */}
                        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                                    <p className="text-slate-500 font-medium">Indexing Campus Data...</p>
                                </div>
                            ) : (
                                <div className="space-y-6 p-4">
                                    {/* People Section */}
                                    {(activeTab === 'all' || activeTab === 'people') && filteredPeople.length > 0 && (
                                        <section>
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2 flex items-center justify-between">
                                                {query ? `Directory (${filteredPeople.length})` : 'Featured Members'}
                                                <User className="w-3 h-3" />
                                            </h3>
                                            <div className="space-y-1">
                                                {filteredPeople.map((person) => (
                                                    <button
                                                        key={person.login}
                                                        onClick={() => handleUserClick(person)}
                                                        className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group text-left"
                                                    >
                                                        <div className="relative shrink-0">
                                                            <img src={optimizeImage(person.avatar_url, { width: 96 })} className={`w-12 h-12 rounded-xl shadow-sm ${isOnline(person.last_active_at) ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900' : ''}`} alt="" loading="lazy" decoding="async" />
                                                            {isOnline(person.last_active_at) && (
                                                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full animate-pulse shadow-sm"></span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{person.name}</h4>
                                                            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{person.branch} • {person.points} Points</p>
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Projects Section */}
                                    {(activeTab === 'all' || activeTab === 'projects') && filteredProjects.length > 0 && (
                                        <section>
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2 flex items-center justify-between">
                                                Projects {query ? `(${filteredProjects.length})` : 'Recent'}
                                                <BookOpen className="w-3 h-3" />
                                            </h3>
                                            <div className="space-y-1">
                                                {filteredProjects.map((project, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => project.slug && handleProjectClick(project.slug)}
                                                        className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group text-left"
                                                    >
                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                                                            {project.image ? (
                                                                <img src={optimizeImage(project.image, { width: 96 })} className="w-full h-full object-cover" alt="" loading="lazy" decoding="async" />
                                                            ) : (
                                                                <BookOpen className="w-5 h-5 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{project.title}</h4>
                                                            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">by {project.author} • {project.branch}</p>
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {query && filteredPeople.length === 0 && filteredProjects.length === 0 && (
                                        <div className="py-12 text-center">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">No matches found</h4>
                                            <p className="text-slate-500 text-sm">Try searching for different keywords or domains.</p>
                                        </div>
                                    )}

                                    {!query && (
                                        <div className="pt-4 border-t border-slate-100 dark:border-white/5 px-2">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                Quick Actions <TrendingUp className="w-3 h-3" />
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => { setActiveSection('leaderboard'); onClose(); }}
                                                    className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/10 transition-all text-left"
                                                >
                                                    <Star className="w-5 h-5 shrink-0" />
                                                    <div>
                                                        <div className="font-bold text-sm">View Rankings</div>
                                                        <div className="text-[10px] opacity-70">See top contributors</div>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => { setActiveSection('community'); onClose(); }}
                                                    className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-all text-left"
                                                >
                                                    <History className="w-5 h-5 shrink-0" />
                                                    <div>
                                                        <div className="font-bold text-sm">Latest Activity</div>
                                                        <div className="text-[10px] opacity-70">What's new today</div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-[10px] text-slate-400 font-medium px-6">
                            <div className="flex gap-4">
                                <span>ESC to Close</span>
                                <span>ENTER to Select</span>
                            </div>
                            <div className="flex items-center gap-1">
                                Powered by <span className="font-bold text-indigo-500">CampusConnect v2</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SearchOverlay;
