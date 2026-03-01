import React from 'react';
import { optimizeImage } from '../utils/imageOptimization';
import { Star } from 'lucide-react';

const ProjectCard = ({ title, author, branch, tags, likes, image }: { title: string, author: string, branch: string, tags: string[], likes: number, image: string }) => (
    <div className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-lg dark:hover:shadow-white/5 transition-all hover:-translate-y-1 cursor-pointer flex flex-col">
        <div className="h-48 overflow-hidden relative">
            <div className="absolute inset-0 bg-slate-200 dark:bg-zinc-800 animate-pulse" />
            <img src={optimizeImage(image, { width: 800 })} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-10" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 shadow-sm z-20">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {likes}
            </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{title}</h4>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">
                <span className="font-medium text-slate-700 dark:text-slate-300">{author}</span>
                <span className="text-slate-300 dark:text-white/20">•</span>
                <span>{branch}</span>
            </div>
            <div className="mt-auto flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-medium transition-colors border border-transparent dark:border-white/5">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    </div>
);

export default ProjectCard;
