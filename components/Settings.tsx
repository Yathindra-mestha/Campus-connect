import React from 'react';
import { motion } from 'framer-motion';
import {
    Bell,
    Shield,
    User,
    Palette,
    Globe,
    Lock,
    Eye,
    Moon,
    Sun,
    ChevronRight,
    LogOut,
    Github
} from 'lucide-react';

interface SettingsProps {
    isDarkMode: boolean;
    setIsDarkMode: (val: boolean) => void;
    profileBackground: 'default' | 'landscape';
    setProfileBackground: (val: 'default' | 'landscape') => void;
}

const Settings: React.FC<SettingsProps> = ({ isDarkMode, setIsDarkMode, profileBackground, setProfileBackground }) => {
    const sections = [
        {
            title: 'Appearance',
            icon: Palette,
            items: [
                {
                    label: 'Dark Mode',
                    description: 'Adjust the visual theme of the application',
                    icon: isDarkMode ? Moon : Sun,
                    action: (
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
                        </button>
                    )
                },
                {
                    label: 'Accent Color',
                    description: 'Choose your primary theme color',
                    icon: Palette,
                    value: 'Indigo'
                },
                {
                    label: 'Profile Background',
                    description: 'Choose the background style for your profile',
                    icon: User,
                    action: (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setProfileBackground('default')}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${profileBackground === 'default' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:bg-slate-200'}`}
                            >
                                Default
                            </button>
                            <button
                                onClick={() => setProfileBackground('landscape')}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${profileBackground === 'landscape' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:bg-slate-200'}`}
                            >
                                Landscape
                            </button>
                        </div>
                    )
                },
            ]
        },
        {
            title: 'Account & Security',
            icon: Lock,
            items: [
                {
                    label: 'Privacy Mode',
                    description: 'Hide your profile from public searches',
                    icon: Eye,
                    action: (
                        <button className="w-12 h-6 rounded-full relative bg-slate-200 dark:bg-zinc-800">
                            <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all" />
                        </button>
                    )
                },
            ]
        },
        {
            title: 'Preferences',
            icon: SettingsIcon,
            items: [
                {
                    label: 'Language',
                    description: 'English (US)',
                    icon: Globe,
                },
                {
                    label: 'Email Notifications',
                    description: 'Receive newsletters and project updates',
                    icon: Bell,
                    action: (
                        <button className="w-12 h-6 rounded-full relative bg-indigo-600">
                            <div className="absolute top-1 left-7 w-4 h-4 rounded-full bg-white transition-all" />
                        </button>
                    )
                },
            ]
        }
    ];

    return (
        <div className="min-h-screen pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your account preferences and application settings.</p>
            </div>

            <div className="space-y-12">
                {sections.map((section, idx) => (
                    <motion.section
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                                <section.icon className="w-4 h-4 text-indigo-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">{section.title}</h2>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
                            {section.items.map((item) => (
                                <div key={item.label} className="p-6 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                {item.label}
                                                {item.badge && <span className="px-1.5 py-0.5 rounded bg-green-50 dark:bg-green-500/10 text-green-600 text-[10px] font-black uppercase">{item.badge}</span>}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-500 font-medium">{item.description}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {item.value && <span className="text-sm font-bold text-slate-400">{item.value}</span>}
                                        {item.action ? item.action : <ChevronRight className="w-4 h-4 text-slate-300" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                ))}

            </div>
        </div>
    );
};

// Simple Icon fallback
const SettingsIcon = (props: any) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default Settings;
