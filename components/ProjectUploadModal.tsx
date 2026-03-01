import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link as LinkIcon, Github, Image as ImageIcon, Loader2, Plus, Info, Tag, Trash2 } from 'lucide-react';
import { optimizeImage } from '../utils/imageOptimization';
import { githubService, ProjectData } from '../utils/github';

interface ProjectUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    project?: ProjectData;
    onSuccess?: () => void;
    addToast: (type: 'success' | 'error' | 'info', message: string) => void;
    currentUser?: any;
}

const ProjectUploadModal: React.FC<ProjectUploadModalProps> = ({ isOpen, onClose, project, onSuccess, addToast, currentUser }) => {
    const isEditing = !!project;
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState<ProjectData>(project || {
        title: '',
        description: '',
        tags: [],
        github_url: '',
        image: '',
        branch: ''
    });

    React.useEffect(() => {
        if (project) setFormData(project);
    }, [project]);
    const [currentTag, setCurrentTag] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddTag = () => {
        if (currentTag && !formData.tags.includes(currentTag)) {
            setFormData({ ...formData, tags: [...formData.tags, currentTag] });
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                if (!currentUser) {
                    addToast('info', 'Image upload disabled in guest mode.');
                    return;
                }
                // Mock success for auth users since no backend
                addToast('success', 'Image structure captured. Note: Real upload needs backend.');
            } catch (error: any) {
                addToast('error', `Upload failed: ${error.message}`);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSaving(true);
        try {
            if (!currentUser) {
                addToast('info', 'Project upload disabled in guest mode.');
                onSuccess?.();
                onClose();
                return;
            }

            // Allow project creation mock
            addToast('success', 'Project created successfully! (Mocked since no backend)');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Failed to save project', error);
            addToast('error', `Error: ${error.message || 'Failed to save project'}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
                >
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload New Project</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Project Title</label>
                            <input
                                required
                                type="text"
                                placeholder="Enter a catchy title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="What does your project do? What problem does it solve?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white resize-none"
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cover Image</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative h-48 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all group overflow-hidden"
                            >
                                {formData.image ? (
                                    <>
                                        <img src={optimizeImage(formData.image, { width: 400 })} className="w-full h-full object-cover" alt="Preview" loading="lazy" decoding="async" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Upload className="w-8 h-8 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-4 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2">
                                            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            {isUploading ? 'Uploading...' : 'Click to upload cover image'}
                                        </p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* GitHub URL */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Github className="w-4 h-4" /> GitHub Repository URL
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://github.com/..."
                                    value={formData.github_url}
                                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                                />
                            </div>

                            {/* Branch */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Branch / Domain</label>
                                <select
                                    required
                                    value={formData.branch || ''}
                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                                >
                                    <option value="" disabled>Select Branch</option>
                                    <option value="CSE">Computer Science</option>
                                    <option value="ECE">Electronics</option>
                                    <option value="Mech">Mechanical</option>
                                    <option value="Civil">Civil</option>
                                </select>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Tag className="w-4 h-4" /> Tags
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add tag..."
                                        value={currentTag}
                                        onChange={(e) => setCurrentTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="p-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 min-h-[32px] mt-2">
                                    {formData.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-100 dark:border-indigo-500/20">
                                            {tag}
                                            <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || isUploading}
                                className="flex-[2] px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 text-sm"
                            >
                                {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Upload Project')}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProjectUploadModal;
