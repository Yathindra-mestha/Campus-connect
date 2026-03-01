import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Mail, Github, Linkedin, ArrowLeft, User } from 'lucide-react';
import { supabase } from '../src/lib/supabaseClient';

const PublicProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data && !error) {
                    setProfile(data);
                }
            } catch (err) {
                console.error('Error fetching public profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-24 text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Profile Not Found</h2>
                <button
                    onClick={() => navigate('/members')}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                    Back to Members Directory
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl"
            >
                <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                </div>

                <div className="px-8 pb-12">
                    <div className="relative -mt-20 mb-8">
                        <div className="w-40 h-40 rounded-3xl overflow-hidden border-8 border-white dark:border-[#1e1e1e] shadow-2xl bg-white dark:bg-[#1c1c1e]">
                            <img
                                src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.name}`}
                                alt={profile.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{profile.name}</h1>
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                <MapPin className="w-5 h-5" />
                                {profile.branch || 'General Member'}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            {profile.github_url && (
                                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                                    <Github className="w-6 h-6 text-slate-900 dark:text-white" />
                                </a>
                            )}
                            {profile.linkedin_url && (
                                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                                    <Linkedin className="w-6 h-6 text-[#0077b5]" />
                                </a>
                            )}
                            <a href={`mailto:${profile.email}`} className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                                <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </a>
                        </div>
                    </div>

                    <div className="mt-12 pt-12 border-t border-slate-100 dark:border-white/5">
                        <h2 className="text-sm font-black text-indigo-500 uppercase tracking-widest mb-6 leading-none">About Member</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Member Since</span>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                    {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Status</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-lg font-bold text-slate-900 dark:text-white capitalize">Active Connection</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PublicProfile;
