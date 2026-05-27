import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { X, Github, ExternalLink, Calendar, User, BookOpen, Tag, Pencil, Trash2, FileText, ChevronLeft, ArrowUp, Layout, Settings } from 'lucide-react';
import { ProjectData } from '../utils/github';

interface ProjectDetailOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    project: ProjectData | null;
    onEdit?: (project: ProjectData) => void;
    onDelete?: (project: ProjectData) => void;
    currentUser?: any;
}

const ProjectDetailOverlay: React.FC<ProjectDetailOverlayProps> = ({
    isOpen,
    onClose,
    project,
    onEdit,
    onDelete,
    currentUser
}) => {
    if (!isOpen || !project) return null;

    const getActiveUser = (u: any) => {
        if (u && u.email) return u;
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('googleUser');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed && parsed.email) return parsed;
                } catch (e) {}
            }
        }
        return u || { name: 'Guest Developer', login: 'guest', email: 'guest@campusconnect.edu' };
    };

    const activeUser = getActiveUser(currentUser);
    const isAdmin = activeUser && (
        (activeUser.email && activeUser.email.trim().toLowerCase() === 'mesthayathi04@gmail.com') ||
        (activeUser.login && activeUser.login.trim().toLowerCase() === 'mesthayathi04')
    );
    const isOwner = activeUser && (
        isAdmin ||
        (project.author_login && activeUser.login && project.author_login.toLowerCase() === activeUser.login.toLowerCase()) ||
        (project.author && activeUser.name && project.author.toLowerCase() === activeUser.name.toLowerCase()) ||
        (project.author_login && activeUser.email && project.author_login.toLowerCase() === activeUser.email.split('@')[0].toLowerCase())
    );

    // Scroll to Top logic
    const mainContentRef = React.useRef<HTMLDivElement>(null);
    const [showScrollTop, setShowScrollTop] = React.useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setShowScrollTop(e.currentTarget.scrollTop > 400);
    };

    // Extract headers for left navigation
    const sections = React.useMemo(() => {
        if (!project.body) return [{ id: 'overview', title: 'Project Overview' }];
        const headerMatches = project.body.match(/^##\s+(.*)/gm) || [];
        const baseSections = [{ id: 'overview', title: 'Project Overview' }];
        const dynamicSections = headerMatches.map(h => {
            const title = h.replace(/^##\s+/, '').trim();
            return { id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), title };
        });
        return [...baseSections, ...dynamicSections];
    }, [project.body]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-white dark:bg-[#070709] overflow-hidden animate-in fade-in duration-300">
            {/* Ambient Background glows */}
            <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none z-0" />
            <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-500/5 dark:bg-purple-600/5 blur-[150px] rounded-full pointer-events-none z-0" />

            {/* Top Navigation Bar - Premium Style */}
            <header className="flex items-center justify-between px-4 sm:px-6 h-16 border-b border-slate-100 dark:border-white/5 bg-white/70 dark:bg-[#070709]/70 backdrop-blur-2xl z-50 sticky top-0 shrink-0">
                <div className="flex items-center gap-6 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-semibold text-sm group whitespace-nowrap shrink-0 cursor-pointer"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform shrink-0" />
                        Back to Projects
                    </button>
                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10 hidden md:block shrink-0" />
                    <nav className="hidden md:flex items-center gap-2 text-sm shrink-0">
                        <span className="text-slate-400">Projects</span>
                        <ChevronLeft className="w-3.5 h-3.5 rotate-180 text-slate-300 shrink-0" />
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-[200px]">
                            {project.title}
                        </span>
                    </nav>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer shrink-0"
                    >
                        <X className="w-5 h-5 shrink-0" />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden z-10">
                {/* Left Sidebar: Dynamic Navigation */}
                <aside className="w-72 hidden lg:flex flex-col border-r border-slate-100 dark:border-white/5 bg-slate-50/10 dark:bg-[#0a0a0d] p-8 overflow-y-auto shrink-0">
                    <div className="mb-8 px-4">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                            <Layout className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Navigation</span>
                        </div>
                    </div>

                    <nav className="space-y-1.5">
                        {sections.map((section, idx) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className="flex items-center w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all group hover:bg-white dark:hover:bg-white/5 hover:shadow-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                                <span className={`w-1.5 h-1.5 rounded-full mr-3 transition-all ${idx === 0 ? 'bg-indigo-500 shadow-md shadow-indigo-500/50' : 'bg-transparent group-hover:bg-indigo-300'}`} />
                                {section.title}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto pt-8 border-t border-slate-200 dark:border-white/10">
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 relative z-10">Developed By</p>
                            <div className="flex items-center gap-3 relative z-10">
                                <img
                                    src={`https://github.com/${project.author_login}.png`}
                                    alt={project.author}
                                    className="w-10 h-10 rounded-xl border-2 border-white/20 dark:border-white/10 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(project.author || 'Developer')}&background=6366f1&color=fff&bold=true`;
                                    }}
                                />
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{project.author}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Project Architect</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area: Responsive Triple Column */}
                <main
                    ref={mainContentRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto custom-scrollbar relative bg-white dark:bg-[#070709]"
                >
                    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12 lg:px-16 lg:py-20 flex flex-col xl:flex-row gap-20">
                        {/* Center Column: Documentation Body */}
                        <article className="flex-1 min-w-0">
                            {/* Project Banner/Image */}
                            {project.image && (
                                <div id="overview" className="mb-12 sm:mb-16 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/5 border border-slate-200/50 dark:border-white/5 bg-slate-100 dark:bg-slate-900 p-1">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full aspect-[16/9] sm:aspect-[21/9] object-cover rounded-[1.8rem] hover:scale-[1.02] transition-transform duration-700"
                                    />
                                </div>
                            )}

                            <div className="mb-12 sm:mb-16">
                                <header className="max-w-3xl">
                                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                                        <div className="h-[2px] w-12 bg-indigo-500" />
                                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
                                            Featured Project
                                        </span>
                                    </div>
                                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-slate-900 dark:text-white mb-6 sm:mb-8 tracking-tight leading-[1.1] break-words">
                                        {project.title}
                                    </h1>
                                    <p className="text-lg sm:text-xl lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        {project.description}
                                    </p>
                                </header>
                            </div>

                            {/* Markdown Rendering with Custom Refined Blocks */}
                            <div className="max-w-none">
                                <ReactMarkdown
                                    components={{
                                        h2: ({ node, ...props }) => {
                                            const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                            const index = sections.findIndex(s => s.id === id);
                                            return (
                                                <h2 id={id} className="group relative scroll-mt-24 flex items-center gap-4 text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-24 mb-8 pb-3 border-b border-slate-100 dark:border-white/5">
                                                    <span className="text-indigo-500/30 dark:text-indigo-400/25 font-black text-4xl sm:text-5xl tabular-nums">
                                                        {String(index >= 0 ? index : 0).padStart(2, '0')}
                                                    </span>
                                                    <span>{props.children}</span>
                                                </h2>
                                            );
                                        },
                                        h3: ({ node, ...props }) => (
                                            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-16 mb-6">
                                                {props.children}
                                            </h3>
                                        ),
                                        p: ({ node, ...props }) => (
                                            <p className="text-slate-650 dark:text-slate-300 text-[18px] leading-[1.85] mb-8 font-normal">
                                                {props.children}
                                            </p>
                                        ),
                                        ul: ({ node, ...props }) => (
                                            <ul className="list-disc pl-8 space-y-3 mb-8 text-slate-650 dark:text-slate-300 text-[18px] leading-[1.8] font-normal">
                                                {props.children}
                                            </ul>
                                        ),
                                        ol: ({ node, ...props }) => (
                                            <ol className="list-decimal pl-8 space-y-3 mb-8 text-slate-650 dark:text-slate-300 text-[18px] leading-[1.8] font-normal">
                                                {props.children}
                                            </ol>
                                        ),
                                        li: ({ node, ...props }) => (
                                            <li className="pl-2 text-slate-650 dark:text-slate-300">
                                                {props.children}
                                            </li>
                                        ),
                                        blockquote: ({ node, ...props }) => (
                                            <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/5 p-8 rounded-[2rem] text-xl sm:text-2xl italic font-medium my-12 text-slate-700 dark:text-slate-200">
                                                {props.children}
                                            </blockquote>
                                        ),
                                        pre: ({ node, ...props }) => (
                                            <pre className="bg-slate-900 dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 shadow-xl my-12 overflow-x-auto custom-scrollbar">
                                                {props.children}
                                            </pre>
                                        ),
                                        code: ({ node, className, children, ...props }) => {
                                            const isInline = !className;
                                            return isInline ? (
                                                <code className="text-indigo-650 dark:text-indigo-455 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-lg font-bold text-sm">
                                                    {children}
                                                </code>
                                            ) : (
                                                <code className="text-slate-100 dark:text-slate-200 font-mono text-sm leading-relaxed block whitespace-pre">
                                                    {children}
                                                </code>
                                            );
                                        },
                                        strong: ({ node, ...props }) => (
                                            <strong className="text-slate-950 dark:text-white font-bold">
                                                {props.children}
                                            </strong>
                                        )
                                    }}
                                >
                                    {project.body || ''}
                                </ReactMarkdown>
                            </div>

                            {/* Custom "Key Features" Callout block inspiration */}
                            {!project.body?.includes('Key Features') && (
                                <div className="mt-16 p-10 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 border-dashed">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-2xl font-bold dark:text-white">Project Highlights</h3>
                                    </div>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {project.tags && project.tags.length > 0 ? (
                                            project.tags.map(tag => (
                                                <li key={tag} className="flex items-start gap-3">
                                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                                    <span className="text-slate-600 dark:text-slate-400 font-medium">{tag} integration and implementation.</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="flex items-start gap-3 col-span-full">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                                <span className="text-slate-500 dark:text-slate-400 italic">No highlights specified.</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </article>

                        {/* Right Column: Meta Information & Stats */}
                        <aside className="w-full xl:w-80 flex-shrink-0 z-10">
                            <div className="sticky top-12 space-y-10">
                                {/* Author Controls Panel */}
                                {isOwner && (
                                    <div className="p-8 rounded-[2rem] bg-indigo-50/30 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10 shadow-lg relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                        <h4 className="flex items-center gap-2 text-[11px] font-black text-indigo-650 dark:text-indigo-400 mb-6 uppercase tracking-[0.2em] relative z-10">
                                            <Settings className="w-4 h-4 animate-spin-slow" />
                                            Developer Panel
                                        </h4>
                                        <div className="space-y-3 relative z-10">
                                            <button
                                                onClick={() => onEdit?.(project)}
                                                className="flex items-center justify-center gap-2.5 w-full h-12 bg-white dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all text-sm cursor-pointer shadow-sm"
                                            >
                                                <Pencil className="w-4 h-4 shrink-0" />
                                                Edit Project
                                            </button>
                                            <button
                                                onClick={() => onDelete?.(project)}
                                                className="flex items-center justify-center gap-2.5 w-full h-12 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all text-sm cursor-pointer shadow-sm"
                                            >
                                                <Trash2 className="w-4 h-4 shrink-0" />
                                                Delete Project
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Action Card */}
                                <div className="p-8 rounded-[2rem] bg-white dark:bg-[#0a0a0d] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                    <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-[0.2em]">
                                        <Github className="w-4 h-4" />
                                        Repository
                                    </h4>
                                    <div className="space-y-4">
                                        {project.github_url ? (
                                            <a
                                                href={project.github_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between w-full h-14 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-indigo-500/10 group"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <Github className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                    Source Code
                                                </span>
                                                <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                                            </a>
                                        ) : (
                                            <div className="h-14 flex items-center justify-center p-4 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-2xl text-sm font-bold border border-dashed border-slate-200 dark:border-white/5 italic">
                                                Private Access
                                            </div>
                                        )}
                                        <button className="flex items-center justify-center w-full h-14 px-6 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/5">
                                            Documentation PDF
                                        </button>
                                    </div>
                                </div>

                                {/* Tech Stack Card */}
                                {project.tags && project.tags.length > 0 && (
                                    <div className="p-8 rounded-[2rem] bg-slate-50/50 dark:bg-white/5 border border-slate-100/50 dark:border-white/5">
                                        <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-[0.2em]">
                                            <Tag className="w-4 h-4" />
                                            Technology
                                        </h4>
                                        <div className="flex flex-wrap gap-3">
                                            {project.tags.map(tag => (
                                                <span key={tag} className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-white/10 shadow-sm hover:border-indigo-500 transition-colors cursor-default">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Stats Section */}
                                <div className="px-4">
                                    <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-[0.2em]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        Project Status
                                    </h4>
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between group">
                                            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Phase</span>
                                            <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md tracking-tighter">V 2.0.4</span>
                                        </div>
                                        <div className="flex items-center justify-between group">
                                            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Last Updated</span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">Today</span>
                                        </div>
                                        <div className="flex items-center justify-between group pt-2 border-t border-slate-100 dark:border-white/5">
                                            <span className="text-xs font-semibold text-slate-500">Stability</span>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-3 h-1 rounded-full ${i <= 4 ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50' : 'bg-slate-200 dark:bg-white/10'}`} />)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={() => mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-10 right-10 p-5 bg-white dark:bg-[#121215] text-slate-900 dark:text-white rounded-[2rem] shadow-2xl shadow-indigo-500/20 border border-slate-100 dark:border-white/5 hover:scale-110 active:scale-95 transition-all z-[210] animate-in slide-in-from-bottom duration-300"
                >
                    <ArrowUp className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};

export default ProjectDetailOverlay;
