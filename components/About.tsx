import React from 'react';
import { motion } from 'framer-motion';
import {
    Eye,
    Target,
    Github,
    Linkedin,
    Mail,
    CheckCircle2,
    TrendingUp,
    User,
    GraduationCap,
    Sparkles,
    Code,
    Flame,
    Globe,
    Award
} from 'lucide-react';
import { optimizeImage } from '../utils/imageOptimization';

const About = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black py-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/5 blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>Platform Evolution</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        Building the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Future</span> of Campus Collaboration.
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                        Smart College Community & Innovation Platform: Where academic rigor meets modern development.
                    </p>
                </motion.div>

                {/* Vision & Mission Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
                    {/* Vision Box */}
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="group relative p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 hover:border-indigo-500/50 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden"
                    >
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/30">
                                <Eye className="w-7 h-7 text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Our Vision</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                To revolutionize campus life by creating a seamless, AI-enhanced digital ecosystem where information flows freely and innovation thrives in every corner of the university.
                            </p>
                        </div>
                    </motion.div>

                    {/* Mission Box */}
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="group relative p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 hover:border-violet-500/50 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden"
                    >
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all duration-500" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-8 shadow-lg shadow-violet-500/30">
                                <Target className="w-7 h-7 text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Our Mission</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                empowering students with smart tools for academic excellence, community engagement, and professional growth through a unified, high-performance platform.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Founder Section Header */}
                <div className="mb-16">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
                        <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-sm">The Founders</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white text-center">Meet the Architects</h2>
                </div>

                {/* 4-Box Founder Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {/* Box 1: Core Identity (Yathindra Mestha) */}
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="p-10 rounded-none bg-indigo-600/5 dark:bg-indigo-500/5 backdrop-blur-xl border border-indigo-600/10 dark:border-white/5 relative overflow-hidden group"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-500/20 group-hover:border-indigo-500 transition-colors duration-500">
                                <img src={optimizeImage("https://github.com/Yathindra-mestha.png", { width: 320 })} alt="Developer" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">Yathindra Mestha</h3>
                                <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-sm opacity-90">Lead Visionary & Full Stack</p>
                                <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-none bg-indigo-600/5 dark:bg-white/5 backdrop-blur-md border border-indigo-600/20 dark:border-white/10 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>Driving Innovation</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Box 2: Vinayakahr10 */}
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="p-10 rounded-none bg-indigo-600/5 dark:bg-indigo-500/5 backdrop-blur-xl border border-indigo-600/10 dark:border-white/5 relative overflow-hidden group"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-500/20 group-hover:border-indigo-500 transition-colors duration-500">
                                <img src={optimizeImage("https://github.com/Vinayakahr10.png", { width: 320 })} alt="Developer" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">Vinayakahr10</h3>
                                <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-sm opacity-90">Architect & Developer</p>
                                <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-none bg-indigo-600/5 dark:bg-white/5 backdrop-blur-md border border-indigo-600/20 dark:border-white/10 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Innovation Focus</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Box 3: Jeeshan-jxeexu */}
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="p-10 rounded-none bg-indigo-600/5 dark:bg-indigo-500/5 backdrop-blur-xl border border-indigo-600/10 dark:border-white/5 relative overflow-hidden group"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-500/20 group-hover:border-indigo-500 transition-colors duration-500">
                                <img src={optimizeImage("https://github.com/Jeeshan-jxeexu.png", { width: 320 })} alt="Developer" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">Jeeshan-jxeexu</h3>
                                <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-sm opacity-90">Architect & Developer</p>
                                <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-none bg-indigo-600/5 dark:bg-white/5 backdrop-blur-md border border-indigo-600/20 dark:border-white/10 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>Visionary Path</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Box 4: srujanem */}
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="p-10 rounded-none bg-indigo-600/5 dark:bg-indigo-500/5 backdrop-blur-xl border border-indigo-600/10 dark:border-white/5 relative overflow-hidden group"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-500/20 group-hover:border-indigo-500 transition-colors duration-500">
                                <img src={optimizeImage("https://github.com/srujanem.png", { width: 320 })} alt="Developer" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">srujanem</h3>
                                <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-sm opacity-90">Architect & Developer</p>
                                <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-none bg-indigo-600/5 dark:bg-white/5 backdrop-blur-md border border-indigo-600/20 dark:border-white/10 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Ecosystem Growth</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default About;
