import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { X, Github, ExternalLink, Calendar, User, BookOpen, Tag, Pencil, Trash2, FileText, ChevronLeft, ArrowUp, Layout } from 'lucide-react';
import { ProjectData } from '../utils/github';

interface ProjectDetailOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    project: ProjectData | null;
    onEdit?: (project: ProjectData) => void;
    onDelete?: (project: ProjectData) => void;
}

const ProjectDetailOverlay: React.FC<ProjectDetailOverlayProps> = ({
    isOpen,
    onClose,
    project,
    onEdit,
    onDelete
}) => {
    if (!isOpen || !project) return null;

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
        <div className="fixed inset-0 z-[200] flex flex-col bg-white dark:bg-slate-950 overflow-hidden animate-in fade-in duration-300">
            {/* Top Navigation Bar - Premium Style */}
            <header className="flex items-center justify-between px-6 h-16 border-b border-slate-100 dark:border-white/5 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl z-50 sticky top-0">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-semibold text-sm group"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Projects
                    </button>
                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10 hidden md:block" />
                    <nav className="hidden md:flex items-center gap-2 text-sm">
                        <span className="text-slate-400">Projects</span>
                        <ChevronLeft className="w-3.5 h-3.5 rotate-180 text-slate-300" />
                        <span className="text-slate-900 dark:text-white font-bold truncate max-w-[200px]">
                            {project.title}
                        </span>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Dynamic Navigation */}
                <aside className="w-72 hidden lg:flex flex-col border-r border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-slate-900/10 p-8 overflow-y-auto">
                    <div className="mb-8 px-4">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                            <Layout className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Navigation</span>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {sections.map((section, idx) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className="flex items-center w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all group hover:bg-white dark:hover:bg-white/5 hover:shadow-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                                <span className={`w-1.5 h-1.5 rounded-full mr-3 transition-all ${idx === 0 ? 'bg-indigo-500' : 'bg-transparent group-hover:bg-indigo-300'}`} />
                                {section.title}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto pt-8 border-t border-slate-200 dark:border-white/10">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Developed By</p>
                            <div className="flex items-center gap-3">
                                <img
                                    src={`https://github.com/${project.author_login}.png`}
                                    alt={project.author}
                                    className="w-10 h-10 rounded-xl border-2 border-white/20"
                                />
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold truncate">{project.author}</p>
                                    <p className="text-[10px] opacity-70">Project Architect</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area: Responsive Triple Column */}
                <main
                    ref={mainContentRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto custom-scrollbar relative bg-white dark:bg-slate-950"
                >
                    <div className="max-w-5xl mx-auto px-6 py-12 lg:px-16 lg:py-20 flex flex-col xl:flex-row gap-16">
                        {/* Center Column: Documentation Body */}
                        <article className="flex-1 min-w-0">
                            {/* Project Banner/Image */}
                            {project.image && (
                                <div id="overview" className="mb-16 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/10 border border-slate-200/50 dark:border-white/5 bg-slate-100 dark:bg-slate-900">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full aspect-[21/9] object-cover hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                            )}

                            <div className="mb-16">
                                <header className="max-w-3xl">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="h-[2px] w-12 bg-indigo-500" />
                                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
                                            Featured Project
                                        </span>
                                    </div>
                                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tight leading-[1.1]">
                                        {project.title}
                                    </h1>
                                    <p className="text-xl lg:text-2xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                        {project.description}
                                    </p>
                                </header>
                            </div>

                            {/* Markdown Rendering with Custom Refined Blocks */}
                            <div className="prose prose-slate dark:prose-invert max-w-none 
                                prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight
                                prose-h2:flex prose-h2:items-center prose-h2:gap-5 prose-h2:text-4xl prose-h2:mt-24 prose-h2:mb-10 prose-h2:pb-6 prose-h2:border-b prose-h2:border-slate-100 dark:prose-h2:border-white/5
                                prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:text-xl prose-p:leading-[1.8]
                                prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-li:text-xl prose-li:my-2
                                prose-strong:text-slate-950 dark:prose-strong:text-white prose-strong:font-bold
                                prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-500/10 prose-code:px-2.5 prose-code:py-1 prose-code:rounded-xl prose-code:font-bold prose-code:before:content-none prose-code:after:content-none
                                prose-pre:bg-slate-900 dark:prose-pre:bg-black prose-pre:border prose-pre:border-white/10 prose-pre:rounded-[2rem] prose-pre:p-8 prose-pre:shadow-2xl prose-pre:my-10
                                prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/50 dark:prose-blockquote:bg-indigo-500/5 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-blockquote:text-2xl prose-blockquote:italic prose-blockquote:font-medium
                            "
                            >
                                <ReactMarkdown
                                    components={{
                                        h2: ({ node, ...props }) => {
                                            const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                            const index = sections.findIndex(s => s.id === id);
                                            return (
                                                <h2 id={id} className="group relative scroll-mt-24">
                                                    <span className="text-indigo-500/20 dark:text-white/5 font-black text-5xl tabular-nums">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </span>
                                                    <span>{props.children}</span>
                                                </h2>
                                            )
                                        }
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
                                        {project.tags?.map(tag => (
                                            <li key={tag} className="flex items-start gap-3">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">{tag} integration and implementation.</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </article>

                        {/* Right Column: Meta Information & Stats */}
                        <aside className="w-full xl:w-80 flex-shrink-0">
                            <div className="sticky top-12 space-y-10">
                                {/* Action Card */}
                                <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
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
                                            <div className="h-14 flex items-center justify-center p-4 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-2xl text-sm font-bold border border-dashed border-slate-200 dark:border-white/10 italic">
                                                Private Access
                                            </div>
                                        )}
                                        <button className="flex items-center justify-center w-full h-14 px-6 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/5">
                                            Documentation PDF
                                        </button>
                                    </div>
                                </div>

                                {/* Tech Stack Card */}
                                <div className="p-8 rounded-[2rem] bg-slate-50/50 dark:bg-white/5 border border-slate-100/50 dark:border-white/5">
                                    <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-[0.2em]">
                                        <Tag className="w-4 h-4" />
                                        Technology
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {project.tags?.map(tag => (
                                            <span key={tag} className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-white/10 shadow-sm hover:border-indigo-500 transition-colors cursor-default">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

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
                                                {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-3 h-1 rounded-full ${i <= 4 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'}`} />)}
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
                    className="fixed bottom-10 right-10 p-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-[2rem] shadow-2xl shadow-indigo-500/20 border border-slate-100 dark:border-white/10 hover:scale-110 active:scale-95 transition-all z-[210] animate-in slide-in-from-bottom duration-300"
                >
                    <ArrowUp className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};

export default ProjectDetailOverlay;
