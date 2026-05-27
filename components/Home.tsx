import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { optimizeImage } from '../utils/imageOptimization';
import { ArrowRight, Star, Trophy, Calendar, ChevronRight } from 'lucide-react';
import ProjectCard from './ProjectCard';
import LeaderboardRow from './LeaderboardRow';
import AnimatedCounter from './AnimatedCounter';
import { ProjectData } from '../utils/github';

const Home = ({ setActiveSection, stats, featuredProjects, topContributors, onExplore }: { setActiveSection: (section: string) => void, stats: any, featuredProjects: ProjectData[], topContributors: any[], onExplore: () => void }) => {
    return (
        <>
            {/* Hero Section */}
            <section className="relative pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] transition-colors duration-300"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 dark:opacity-10 blur-[100px] transition-opacity duration-300"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">


                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 transition-colors duration-300"
                        >
                            Learn, Build, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Innovate</span> Together.
                        </motion.h1>



                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <button
                                onClick={onExplore}
                                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-50 dark:text-indigo-900 px-8 py-3.5 rounded-full text-base font-semibold transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 group"
                            >
                                Explore now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 transition-colors duration-300"><AnimatedCounter from={0} to={stats.students} />+</span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Total Students</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 transition-colors duration-300"><AnimatedCounter from={0} to={stats.projects} />+</span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Projects Uploaded</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 transition-colors duration-300"><AnimatedCounter from={0} to={stats.events} />+</span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Events Conducted</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 transition-colors duration-300"><AnimatedCounter from={0} to={stats.contributors} />+</span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">Active Contributors</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trending Projects & Leaderboard Split */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {featuredProjects && featuredProjects.length > 0 ? (
                        <div className="grid lg:grid-cols-3 gap-12">
                            {/* Left Column: Projects (Takes up 2/3) */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
                                        <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                                        Featured Projects
                                    </h3>
                                    <button
                                        onClick={() => setActiveSection('projects')}
                                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors duration-300"
                                    >
                                        View all <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    {featuredProjects.map((project, idx) => (
                                        <ProjectCard
                                            key={project.id || idx}
                                            title={project.title}
                                            author={project.author || project.author_login || 'Unknown'}
                                            branch={project.branch || 'CSE'}
                                            tags={project.tags || []}
                                            likes={project.likes || 0}
                                            image={project.image || ''}
                                            isFeatured={idx === 0}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Leaderboard (Takes up 1/3) */}
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
                                        <Trophy className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                        Top Contributors
                                    </h3>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-300">
                                    <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center transition-colors duration-300">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">This Month</span>
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Points</span>
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                                        {topContributors.length > 0 ? (
                                            topContributors.map((c, i) => (
                                                <LeaderboardRow
                                                    key={c.rank || i}
                                                    rank={c.rank}
                                                    name={c.name}
                                                    branch={c.branch}
                                                    points={c.points}
                                                    avatar_url={c.avatar_url}
                                                />
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-slate-500 text-sm italic">
                                                No contributors yet
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-200 dark:border-zinc-800 transition-colors duration-300">
                                        <button
                                            onClick={() => setActiveSection('leaderboard')}
                                            className="w-full text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                        >
                                            View Full Leaderboard
                                        </button>
                                    </div>
                                </div>

                                {/* Upcoming Events Mini-Widget */}
                                <div className="bg-indigo-600 dark:bg-indigo-500/20 rounded-2xl p-6 text-white dark:text-slate-200 shadow-lg shadow-indigo-200 dark:shadow-none border border-transparent dark:border-indigo-500/30 transition-colors duration-300">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Calendar className="w-5 h-5 text-indigo-200 dark:text-indigo-400" />
                                        <h4 className="font-semibold text-white dark:text-indigo-300">Next Event</h4>
                                    </div>
                                    <h5 className="text-xl font-bold mb-2">Annual Hackathon 2026</h5>
                                    <p className="text-indigo-100 dark:text-slate-400 text-sm mb-4">Join 500+ students for 48 hours of coding, building, and innovation.</p>
                                    <button
                                        onClick={() => setActiveSection('events')}
                                        className="w-full bg-white dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-500/30 transition-colors"
                                    >
                                        Register Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {/* Gorgeous Full-Width Projects Placeholder Call To Action */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative rounded-[2.5rem] p-8 md:p-16 text-center overflow-hidden border border-slate-200 dark:border-white/5 bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/50 dark:from-[#121215] dark:via-[#0a0a0c] dark:to-[#16121a] shadow-xl"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e505_1px,transparent_1px),linear-gradient(to_bottom,#4f46e505_1px,transparent_1px)] bg-[size:20px_20px]" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
                                
                                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2">
                                        <Star className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-3xl md:text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                        Be the First to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Showcase</span> Innovation!
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed">
                                        No projects have been published yet. Share your applications, hardware designs, or research work with the campus community and build your global standing today!
                                    </p>
                                    <button
                                        onClick={() => setActiveSection('projects')}
                                        className="inline-flex items-center gap-2.5 px-8 py-4 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black rounded-full font-bold text-[15px] transition-all shadow-xl hover:scale-105"
                                    >
                                        Submit Your Project <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>

                            {/* Rearranged Wide 2-Column Leaderboard and Event Section */}
                            <div className="grid lg:grid-cols-3 gap-12">
                                {/* Leaderboard Widget (Takes up 2/3 now!) */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
                                            <Trophy className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                            Top Contributors
                                        </h3>
                                    </div>
                                    
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-300">
                                        <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center transition-colors duration-300">
                                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rankings Leaderboard</span>
                                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Points</span>
                                        </div>
                                        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                                            {topContributors.length > 0 ? (
                                                topContributors.map((c, i) => (
                                                    <LeaderboardRow
                                                        key={c.rank || i}
                                                        rank={c.rank}
                                                        name={c.name}
                                                        branch={c.branch}
                                                        points={c.points}
                                                        avatar_url={c.avatar_url}
                                                    />
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-slate-500 text-sm italic">
                                                    No contributors yet
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-200 dark:border-zinc-800 transition-colors duration-300">
                                            <button
                                                onClick={() => setActiveSection('leaderboard')}
                                                className="w-full text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                            >
                                                View Full Leaderboard
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Event and Sidebar Widget (Takes up 1/3) */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
                                            <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                            Upcoming
                                        </h3>
                                    </div>
                                    
                                    <div className="bg-indigo-600 dark:bg-indigo-500/20 rounded-2xl p-6 text-white dark:text-slate-200 shadow-lg shadow-indigo-200 dark:shadow-none border border-transparent dark:border-indigo-500/30 transition-colors duration-300">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Calendar className="w-5 h-5 text-indigo-200 dark:text-indigo-400" />
                                            <h4 className="font-semibold text-white dark:text-indigo-300">Next Event</h4>
                                        </div>
                                        <h5 className="text-xl font-bold mb-2">Annual Hackathon 2026</h5>
                                        <p className="text-indigo-100 dark:text-slate-400 text-sm mb-4">Join 500+ students for 48 hours of coding, building, and innovation.</p>
                                        <button
                                            onClick={() => setActiveSection('events')}
                                            className="w-full bg-white dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-500/30 transition-colors"
                                        >
                                            Register Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default Home;
