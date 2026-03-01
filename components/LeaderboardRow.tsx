import React from 'react';
import { optimizeImage } from '../utils/imageOptimization';

const LeaderboardRow = ({ rank, name, branch, points, badge, avatar_url }: { rank: number, name: string, branch: string, points: number, badge?: string, avatar_url?: string }) => {
    const isTop3 = rank <= 3;
    return (
        <div className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${rank === 1 ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' :
                rank === 2 ? 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10' :
                    rank === 3 ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20' :
                        'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-500 border border-slate-200 dark:border-white/10'
                }`}>
                {rank}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    {avatar_url && <img src={optimizeImage(avatar_url, { width: 48 })} alt="" className="w-6 h-6 rounded-full" loading="lazy" decoding="async" />}
                    <h5 className="font-semibold text-slate-900 dark:text-white truncate transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{name}</h5>
                    {badge && (
                        <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 transition-colors">
                            {badge}
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">{branch}</p>
            </div>
            <div className="font-bold text-slate-900 dark:text-white shrink-0 transition-colors">
                {points.toLocaleString()}
            </div>
        </div>
    );
};

export default LeaderboardRow;
