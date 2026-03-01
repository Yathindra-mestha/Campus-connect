import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Github, ExternalLink, Plus, X, Loader2, Trash2, Pencil, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { optimizeImage } from '../utils/imageOptimization';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import ProjectUploadModal from './ProjectUploadModal';
import ProjectDetailOverlay from './ProjectDetailOverlay';
import { githubService, ProjectData } from '../utils/github';

const categories = [
  { id: 'all', label: 'All Domains' },
  { id: 'cse', label: 'Computer Science' },
  { id: 'ece', label: 'Electronics' },
  { id: 'mech', label: 'Mechanical' },
  { id: 'civil', label: 'Civil' }
];

interface ProjectsProps {
  autoOpenUploadProject?: boolean;
  onUploadProjectHandled?: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({
  autoOpenUploadProject,
  onUploadProjectHandled,
  addToast
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<ProjectData | undefined>(undefined);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await githubService.getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
      addToast('error', 'Failed to load projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  React.useEffect(() => {
    if (autoOpenUploadProject && !isUploadModalOpen) {
      setIsUploadModalOpen(true);
      onUploadProjectHandled?.();
    }
  }, [autoOpenUploadProject, isUploadModalOpen, onUploadProjectHandled]);

  const filteredProjects = projects.filter(project => {
    const matchesTab = activeTab === 'all' || project.branch?.toLowerCase() === activeTab.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      project.title.toLowerCase().includes(query) ||
      (project.author || '').toLowerCase().includes(query) ||
      (project.tags || []).some(tag => tag.toLowerCase().includes(query)) ||
      (project.description || '').toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-0 w-full h-96 bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10">

        {/* Premium Header */}
        <div className="text-center mb-16 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Discover Innovation</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl md:text-7xl font-display font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight"
          >
            Built by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Students.</span><br />
            Driven by <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 text-gradient">Purpose.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 font-medium"
          >
            Explore a curated showcase of world-class projects, research, and applications developed entirely by our campus community.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <button
              onClick={() => {
                setIsUploadModalOpen(true);
              }}
              className="bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10 flex items-center gap-3 mx-auto group hover:scale-105"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Submit Your Work
            </button>
          </motion.div>
        </div>

        <ProjectUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setEditingProject(undefined);
          }}
          project={editingProject}
          onSuccess={() => {
            fetchProjects();
          }}
          addToast={addToast}
        />

        <Routes>
          <Route path=":slug" element={
            <ProjectDetailRouteWrapper
              projects={projects}
              isLoading={isLoading}
              onEdit={(p: ProjectData) => {
                navigate('/projects');
                setEditingProject(p);
                setIsUploadModalOpen(true);
              }}
              onDelete={async (p: ProjectData) => {
                if (window.confirm('Are you sure you want to delete this project?')) {
                  addToast('info', 'Project deletion requires manual removal from github.');
                }
              }}
              onClose={() => navigate('/projects')}
            />
          } />
        </Routes>

        {/* Search & Filter Controls - Floating Glass Bar */}
        <div className="max-w-4xl mx-auto mb-16 sticky top-24 z-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-[2rem] p-2 flex flex-col md:flex-row gap-2 shadow-2xl shadow-indigo-500/5 dark:shadow-none"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-6 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, author, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white pl-14 pr-6 py-4 outline-none placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="h-px md:h-8 w-full md:w-px bg-slate-200 dark:bg-white/10 self-center hidden md:block" />

            {/* Segmented Control Pill Tabs */}
            <div className="flex p-1 bg-slate-100/50 dark:bg-black/50 rounded-[1.5rem] overflow-x-auto custom-scrollbar hide-scrollbar">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 relative ${activeTab === category.id
                    ? 'text-slate-900 dark:text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                  {activeTab === category.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-full shadow-sm"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 whitespace-nowrap">{category.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Loading projects from GitHub...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {filteredProjects.map((project, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (idx % 10) }}
                key={project.id}
              >
                <Link
                  to={`/projects/${project.slug}`}
                  className="group relative rounded-[2rem] glass-card overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 flex flex-col h-full block"
                >
                  {/* Image Section */}
                  <div className="h-64 overflow-hidden relative group/image p-2">
                    <div className="absolute inset-2 rounded-[1.5rem] bg-slate-200 dark:bg-zinc-800 animate-pulse" />
                    {project.image ? (
                      <img
                        src={optimizeImage(project.image, { width: 800 })}
                        alt={project.title}
                        className="w-full h-full object-cover rounded-[1.5rem] relative z-10 transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-[1.5rem] flex items-center justify-center relative z-10">
                        <Github className="w-16 h-16 text-indigo-500/30" />
                      </div>
                    )}

                    {/* Floating Like Badge */}
                    <div className="absolute top-6 right-6 bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5 shadow-lg z-20 transition-transform group-hover:scale-110">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {project.likes || 0}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 pb-6 flex-1 flex flex-col relative z-20">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
                      <span className="text-indigo-600 dark:text-indigo-400">{project.branch}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>{project.author}</span>
                    </div>

                    <h4 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {project.title}
                    </h4>

                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                      {project.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-medium border border-transparent dark:border-white/5 transition-colors group-hover:bg-slate-200 dark:group-hover:bg-white/10">
                          {tag}
                        </span>
                      ))}
                      {project.tags && project.tags.length > 3 && (
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs font-medium border border-transparent dark:border-white/5">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Footer Stats & Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-4">
                        {project.github_url ? (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-colors shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                            title="View Source"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        ) : (
                          <span />
                        )}


                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          navigate(`/projects/${project.slug}`);
                        }}
                        className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm"
                      >
                        Read full story
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-8 shadow-inner">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">No matching projects</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg">
              We couldn't find any projects matching your criteria. Try adjusting your search term or domain filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveTab('all');
              }}
              className="mt-8 text-indigo-600 dark:text-indigo-400 font-bold hover:underline underline-offset-4"
            >
              Clear Filters
            </button>
          </motion.div>
        )}


      </div>
    </div>
  );
};

// Route wrapper to extract slug and find project
const ProjectDetailRouteWrapper = ({ projects, isLoading, onEdit, onDelete, onClose }: any) => {
  const { slug } = useParams<{ slug: string }>();

  if (isLoading) return null;

  const project = projects.find((p: ProjectData) => p.slug === slug);

  if (!project) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#121212] p-8 rounded-2xl max-w-sm w-full text-center">
          <h3 className="text-xl font-bold mb-4">Project Not Found</h3>
          <p className="text-slate-500 mb-6">The project you are looking for does not exist or has been removed.</p>
          <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Return to Projects</button>
        </div>
      </div>
    );
  }

  return (
    <ProjectDetailOverlay
      isOpen={true}
      onClose={onClose}
      project={project}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default Projects;
