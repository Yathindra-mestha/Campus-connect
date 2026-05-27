import React from 'react';
import { optimizeImage } from '../utils/imageOptimization';
import { Star } from 'lucide-react';

const ProjectCard = ({ title, author, branch, tags, likes, image, isFeatured }: { title: string, author: string, branch: string, tags: string[], likes: number, image: string, isFeatured?: boolean }) => (
    <div className={`group rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#121212] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-none transition-all duration-500 hover:-translate-y-1.5 cursor-pointer flex ${isFeatured ? 'flex-col sm:flex-row sm:col-span-2 h-auto sm:h-80' : 'flex-col h-full'}`}>
        <div className={`${isFeatured ? 'h-64 sm:h-full sm:w-[45%] shrink-0' : 'h-48'} overflow-hidden relative p-2`}>
            <div className="absolute inset-2 rounded-[1.5rem] bg-slate-200 dark:bg-zinc-800 animate-pulse" />
            <img src={optimizeImage(image, { width: 800 })} alt={title} className="w-full h-full object-cover rounded-[1.5rem] relative z-10 transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
            <div className="absolute top-6 right-6 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1 shadow-md z-20">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {likes}
            </div>
        </div>
        <div className="p-8 flex-1 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                    <span className="text-indigo-600 dark:text-indigo-400">{branch}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span>{author}</span>
                </div>
                <h4 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">{title}</h4>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                {tags.slice(0, isFeatured ? 5 : 3).map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors border border-transparent dark:border-white/5">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    </div>
);

export default ProjectCard;
