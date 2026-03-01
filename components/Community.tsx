import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { optimizeImage } from '../utils/imageOptimization';
import {
  Hash,
  Send,
  PlusCircle,
  Search,
  Info,
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Settings,
  Layout,
  Volume2,
  Sparkles,
  Plus,
  X,
  ArrowRight,
  Filter,
  Github
} from 'lucide-react';

const CHANNELS = [
  { id: 'global', name: 'global-chat', description: 'Public discussion for everyone' },
  { id: 'cse', name: 'cse-dept', description: 'Computer Science Department' },
  { id: 'ece', name: 'ece-dept', description: 'Electronics Department' },
  { id: 'mech', name: 'mech-dept', description: 'Mechanical Department' },
  { id: 'civil', name: 'civil-dept', description: 'Civil Department' },
];

const FORUM_CATEGORIES = [
  { id: 'all', name: 'All Topics', icon: Layout },
  { id: 'general', name: 'General Discussions', icon: MessageSquare },
];

const DISCUSSIONS = [
  {
    id: 1,
    author: 'Sarah Jenkins',
    branch: 'CSE',
    time: '2h ago',
    category: 'general',
    title: 'Modern Architecture Patterns for Campus Apps',
    content: 'Let\'s talk about how to scale student-led projects using serverless tech and unified data layers.',
    tags: ['Architecture', 'Scaling'],
    likes: 42,
    replies: 12
  },
  {
    id: 2,
    author: 'Rahul Sharma',
    branch: 'ECE',
    time: '5h ago',
    category: 'general',
    title: 'Next-gen IoT Sensors for Campus Smart Grid',
    content: 'Exploring the latest LoRaWAN sensors for monitoring building energy consumption in real-time.',
    tags: ['IoT', 'Sustainability'],
    likes: 31,
    replies: 5
  }
];

interface Message {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
  channelId: string;
}

interface CommunityProps {
  autoOpenNewPost?: boolean;
  onNewPostHandled?: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string, duration?: number) => void;
}

const Community: React.FC<CommunityProps> = ({ autoOpenNewPost, onNewPostHandled, addToast }) => {
  const [activeTab, setActiveTab] = useState('forums');
  const [forumCategory, setForumCategory] = useState('all');
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Sarah Jenkins',
      avatar: 'https://picsum.photos/seed/sarah/100',
      content: 'Thinking of starting a new AI study group here. Anyone in?',
      timestamp: '2:30 PM',
      channelId: 'global'
    },
    {
      id: '2',
      sender: 'Alex Chen',
      avatar: 'https://picsum.photos/seed/alex/100',
      content: 'I\'m definitely interested! Which stack are we looking at?',
      timestamp: '2:35 PM',
      channelId: 'global'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannel = CHANNELS.find(c => c.id === activeTab);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab !== 'forums') {
      const timer = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, activeTab]);

  useEffect(() => {
    if (autoOpenNewPost && !isNewPostModalOpen) {
      setIsNewPostModalOpen(true);
      onNewPostHandled?.();
    }
  }, [autoOpenNewPost, isNewPostModalOpen, onNewPostHandled]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "Anonymous Student",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous",
      content: inputText,
      timestamp: 'Just now',
      channelId: activeTab
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const filteredMessages = messages.filter(m => m.channelId === activeTab);
  const filteredDiscussions = DISCUSSIONS.filter(d =>
    (forumCategory === 'all' || d.category === forumCategory) &&
    (d.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#1e1f22] text-slate-900 dark:text-[#dbdee1] overflow-hidden">

      {/* Premium Sidebar */}
      <aside className="w-72 bg-white/80 dark:bg-[#2b2d31]/90 backdrop-blur-xl flex flex-col border-r border-slate-200 dark:border-white/5 hidden md:flex z-30">
        <div className="h-16 flex items-center px-6 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">Hub</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          <section>
            <div className="px-2 mb-3">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Navigation</span>
            </div>
            <div className="space-y-1">
              {FORUM_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveTab('forums'); setForumCategory(cat.id); }}
                  className={`w - full flex items - center gap - 3 px - 3 py - 2.5 rounded - xl text - sm font - bold transition - all group ${activeTab === 'forums' && forumCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                    : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                    } `}
                >
                  <cat.icon className={`w - 4 h - 4 ${activeTab === 'forums' && forumCategory === cat.id ? 'text-white' : 'group-hover:text-indigo-600'} `} />
                  {cat.name}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="px-2 mb-3 flex justify-between items-center group">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Channels</span>
              <Plus className="w-4 h-4 text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors" />
            </div>
            <div className="space-y-1">
              {CHANNELS.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setActiveTab(channel.id)}
                  className={`w - full flex items - center gap - 3 px - 3 py - 2.5 rounded - xl text - sm font - bold transition - all group ${activeTab === channel.id
                    ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white'
                    : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    } `}
                >
                  <Hash className={`w - 4 h - 4 ${activeTab === channel.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'} `} />
                  {channel.name}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-black/5 dark:border-white/5 mt-auto">
          <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-2xl flex items-center gap-3">
            <div className="relative">
              <img
                src={"https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky"}
                className="w-10 h-10 rounded-full"
                alt="user"
              />
              <div className={`absolute - bottom - 0.5 - right - 0.5 w - 3 h - 3 bg-green-500 rounded - full border - 2 border - white dark: border - zinc - 800`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate">Anonymous Student</p>
              <p className="text-[10px] text-slate-500">Contributor</p>
            </div>
            <Settings className="w-4 h-4 text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-white dark:bg-[#313338] relative z-20">
        <AnimatePresence mode="wait">
          {activeTab === 'forums' ? (
            <motion.div
              key="forums"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <header className="h-16 border-b border-slate-100 dark:border-white/5 flex items-center px-8 justify-between bg-white/50 dark:bg-[#313338]/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-xl">
                    <Layout className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-black text-lg">{FORUM_CATEGORIES.find(c => c.id === forumCategory)?.name || 'Forums'}</h3>
                </div>
                <button
                  onClick={() => {
                    setIsNewPostModalOpen(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  NEW POST
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search discussions..."
                        className="w-full bg-slate-50 dark:bg-black/20 border-none rounded-2xl pl-11 pr-4 py-3 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button className="p-3 bg-slate-50 dark:bg-black/20 rounded-2xl"><Filter className="w-4 h-4 text-slate-400" /></button>
                  </div>

                  {filteredDiscussions.map((d, idx) => (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-6 bg-white dark:bg-[#2b2d31] rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <img src={optimizeImage(`https://picsum.photos/seed/${d.author}/100`, { width: 32 })} className="w-8 h-8 rounded-full" alt="" loading="lazy" decoding="async" />
                        <div className="flex flex-col">
                          <span className="text-xs font-black group-hover:text-indigo-600 transition-colors">{d.author}</span>
                          <span className="text-[10px] text-slate-400">{d.branch} • {d.time}</span>
                        </div>
                      </div >
                      <h4 className="font-black text-xl mb-2 group-hover:translate-x-1 transition-transform">{d.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{d.content}</p>

                      <div className="flex items-center gap-4 pt-6 border-t border-slate-50 dark:border-white/5">
                        <div className="flex gap-2">
                          {d.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md font-bold text-slate-400">#{t}</span>)}
                        </div>
                        <div className="ml-auto flex items-center gap-4">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400"><ThumbsUp className="w-4 h-4" /> {d.likes}</span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400"><MessageCircle className="w-4 h-4" /> {d.replies}</span>
                        </div>
                      </div>
                    </motion.div >
                  ))}
                </div >
              </div >
            </motion.div >
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col"
            >
              <header className="h-16 border-b border-black/5 dark:border-white/5 flex items-center px-8 bg-white/50 dark:bg-[#313338]/50 backdrop-blur-md">
                <Hash className="w-6 h-6 mr-3 text-indigo-600" />
                <div className="flex flex-col">
                  <h3 className="font-extrabold">{activeChannel?.name}</h3>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">{activeChannel?.description}</span>
                </div>
              </header>

              <div className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar">
                {filteredMessages.map(msg => (
                  <div key={msg.id} className="flex gap-4 group">
                    <img src={optimizeImage(msg.avatar, { width: 40 })} className="w-10 h-10 rounded-full group-hover:scale-105 transition-transform" alt="" loading="lazy" decoding="async" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{msg.sender}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6">
                <form
                  onSubmit={handleSendMessage}
                  className="bg-slate-100 dark:bg-black/20 rounded-3xl p-3 flex items-center gap-4 border border-transparent dark:border-white/5 group focus-within:border-indigo-600/50 transition-all shadow-lg dark:shadow-none"
                >
                  <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><PlusCircle className="w-6 h-6" /></button>
                  <input
                    type="text"
                    placeholder={`Write something to #${activeChannel?.name}...`}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button type="submit" className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all"><Send className="w-5 h-5" /></button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence >
      </main >

      {/* New Post Modal */}
      <AnimatePresence>
        {
          isNewPostModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsNewPostModalOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-xl bg-white dark:bg-[#2b2d31] rounded-[40px] shadow-2xl overflow-hidden relative z-10 p-10"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black">Create Hub Post</h2>
                  <button onClick={() => setIsNewPostModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                  <input type="text" placeholder="Title" className="w-full px-6 py-4 bg-slate-50 dark:bg-black/20 border-none rounded-2xl text-sm font-bold placeholder:text-slate-400" />
                  <textarea rows={4} placeholder="What's on your mind?" className="w-full px-6 py-4 bg-slate-50 dark:bg-black/20 border-none rounded-2xl text-sm font-medium resize-none placeholder:text-slate-400" />
                  <div className="grid grid-cols-2 gap-4">
                    <select className="px-6 py-4 bg-slate-50 dark:bg-black/20 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500">
                      <option>General</option>
                    </select>
                    <input type="text" placeholder="Tags (React, IoT...)" className="px-6 py-4 bg-slate-50 dark:bg-black/20 border-none rounded-2xl text-sm font-medium placeholder:text-slate-400" />
                  </div>
                </div>
                <button className="w-full mt-10 bg-indigo-600 text-white py-5 rounded-3xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all">Publish Post</button>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >
    </div >
  );
};

export default Community;
