import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ExternalLink, User } from 'lucide-react';
import { supabase } from '../src/lib/supabaseClient';
import { Link } from 'react-router-dom';

const MembersList = () => {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (data && !error) {
                    setMembers(data);
                }
            } catch (err) {
                console.error('Error fetching members:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const filteredMembers = members.filter(member =>
        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-12">
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Members Directory</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                    Connect with fellow innovators and builders across campus.
                </p>
            </div>

            <div className="relative mb-12">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by name, branch, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 dark:text-white"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-slate-100 dark:bg-white/5 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredMembers.map((member, index) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative bg-white dark:bg-[#1e1e1e] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="p-8">
                                    <div className="flex items-center gap-6 mb-6">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-500/20 group-hover:border-indigo-500 transition-colors">
                                            <img
                                                src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.name}`}
                                                alt={member.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">{member.name}</h2>
                                            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span className="truncate">{member.branch || 'General Member'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <Link
                                            to={`/profile/${member.id}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                                        >
                                            <User className="w-4 h-4" />
                                            View Profile
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!loading && filteredMembers.length === 0 && (
                <div className="text-center py-24 bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
                    <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No members found</h3>
                    <p className="text-slate-500 dark:text-slate-400">Try adjusting your search terms.</p>
                </div>
            )}
        </div>
    );
};

export default MembersList;
