import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { optimizeImage } from './utils/imageOptimization';
import {
  MessageSquare,
  Calendar,
  Lightbulb,
  Trophy,
  ArrowRight,
  Users,
  Award,
  BookOpen,
  ChevronRight,
  Github,
  Star,
  Sun,
  Moon,
  Menu,
  X,
  Linkedin,
  Mail,
  Twitter,
  ArrowUp
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import ToastContainer, { ToastMessage, ToastType } from './components/Toast';
import Community from './components/Community';
import Events from './components/Events';
import Projects from './components/Projects';
import Leaderboard from './components/Leaderboard';
import About from './components/About';
import Profile from './components/Profile';
import Settings from './components/Settings';
import SearchOverlay from './components/SearchOverlay';
import Dashboard from './components/Dashboard';
import {
  LogOut,
  Settings as SettingsIcon,
  LayoutDashboard,
  User as UserIcon,
  Search as SearchIcon
} from 'lucide-react';
import { githubService, ProjectData } from './utils/github';
import Home from './components/Home';
import GoogleLogin from './components/GoogleLogin';

const GOOGLE_CLIENT_ID = "779781376861-biqrgahce5qi427un2o1go6m65l411h6.apps.googleusercontent.com";

const App = () => {
  const [user, setUser] = useState<{ login: string, avatar_url: string, name?: string, email?: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('googleUser');
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });
  const navigate = useNavigate();
  const location = useLocation();

  // We leave this here so UI components can derive `activeSection` safely without breaking nested routes
  const activeSection = location.pathname === '/'
    ? 'home'
    : location.pathname.split('/')[1] || 'home';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [profileBackground, setProfileBackground] = useState<'default' | 'landscape'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('profileBackground') as 'default' | 'landscape') || 'default';
    }
    return 'default';
  });

  const addToast = (type: ToastType, message: string, duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };



  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;

        // If mobile menu is open, don't hide the navbar
        if (isMenuOpen) {
          setIsVisible(true);
          return;
        }

        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          // Scrolling down
          setIsVisible(false);
        } else {
          // Scrolling up
          setIsVisible(true);
        }

        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY, isMenuOpen]);





  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      // React Router handles popstate naturally, but we might want to sync custom state
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname]);

  // Centralized navigation handler to update URL and React state
  const handleNavigate = (section: string, slugOrLogin?: string | null) => {
    if (section === 'home') {
      navigate('/');
    } else if (section === 'profile') {
      if (slugOrLogin) {
        navigate(`/profile/${slugOrLogin}`);
      } else {
        navigate('/profile');
      }
    } else if (section === 'projects' && slugOrLogin) {
      navigate(`/projects/${slugOrLogin}`);
    } else {
      navigate(`/${section}`);
    }
  };

  // Scroll to top when section changes MANUALLY (not on refresh)
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Persist scroll position
  React.useEffect(() => {
    const handleScroll = () => {
      localStorage.setItem('scrollPosition', window.scrollY.toString());
    };

    // Restore scroll position on mount
    const savedScroll = localStorage.getItem('scrollPosition');
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll, 10));
      }, 100);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  React.useEffect(() => {
    localStorage.setItem('profileBackground', profileBackground);
  }, [profileBackground]);

  const [stats, setStats] = useState({
    students: 2500,
    projects: 450,
    events: 120,
    contributors: 850
  });
  const [featuredProjects, setFeaturedProjects] = useState<ProjectData[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const [liveStats, allProjects, rankings] = await Promise.all([
          githubService.getSystemStats(),
          githubService.getAllProjects(),
          githubService.getLeaderboard()
        ]);
        setStats(liveStats);
        setFeaturedProjects(allProjects.slice(0, 4));
        setLeaderboard(rankings);
      } catch (error) {
        console.error('Failed to fetch stats/projects/rankings', error);
      }
    };
    fetchStats();
  }, []);

  // Wrapper for profile route to extract username parm
  const ProfileRouteWrapper = ({ currentUser, addToast, profileBackground }: any) => {
    const { username } = useParams<{ username: string }>();
    const [targetUser, setTargetUser] = useState<any>({ login: username });

    useEffect(() => {
      if (username && username !== currentUser?.login) {
        githubService.getLeaderboard().then((leaderboard: any[]) => {
          const target = leaderboard.find(u => u.login === username);
          if (target) {
            setTargetUser(target);
          }
        }).catch(console.error);
      }
    }, [username, currentUser]);

    return <Profile currentUser={currentUser} targetUser={targetUser} addToast={addToast} profileBackground={profileBackground} />;
  };

  const renderSection = () => {
    return (
      <Routes>
        <Route path="/" element={<Home
          setActiveSection={handleNavigate}
          stats={stats}
          featuredProjects={featuredProjects}
          topContributors={leaderboard.slice(0, 5)}
          onExplore={() => {
            handleNavigate('community');
          }}
        />} />
        <Route path="/community" element={<Community
          addToast={addToast}
        />} />
        <Route path="/events" element={<Events />} />
        <Route path="/projects/*" element={<Projects
          addToast={addToast}
          currentUser={user}
        />} />
        <Route path="/leaderboard" element={<Leaderboard
          setActiveSection={(section) => { if (section !== 'profile') handleNavigate(section) }}
          setSelectedUserForProfile={(u) => { if (u) handleNavigate('profile', u.login) }}
        />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile currentUser={user} targetUser={user} addToast={addToast} profileBackground={profileBackground} />} />
        <Route path="/profile/:username" element={<ProfileRouteWrapper currentUser={user} addToast={addToast} profileBackground={profileBackground} />} />
        <Route path="/settings" element={
          <Settings
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            profileBackground={profileBackground}
            setProfileBackground={setProfileBackground}
          />
        } />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 flex flex-col transition-colors duration-300 relative">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {/* Navigation */}
      <motion.header
        initial="visible"
        animate={isVisible ? "visible" : "hidden"}
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: -100, opacity: 0 }
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 w-full"
      >
        <nav className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div
                className="flex-1 flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  handleNavigate('home');
                  setIsMenuOpen(false);
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">CampusConnect</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center justify-center space-x-8">
                {['home', 'community', 'events', 'projects', 'leaderboard', 'about'].map((section) => (
                  <button
                    key={section}
                    onClick={() => handleNavigate(section)}
                    className={`text-sm font-medium transition-colors capitalize ${activeSection === section ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                  >
                    {section}
                  </button>
                ))}
              </div>

              <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors ${!user && activeSection !== 'home' ? 'mr-2 sm:mr-4' : ''}`}
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 mr-2 sm:mr-0 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors relative group"
                  aria-label="Search"
                >
                  <SearchIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-black opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <div className="hidden sm:flex items-center gap-4">
                  {!user ? (
                    <GoogleLogin
                      clientId={GOOGLE_CLIENT_ID}
                      onLoginSuccess={(userData) => {
                        setUser(userData);
                        addToast('success', `Welcome back, ${userData.name}!`);
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{user.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{user.email}</span>
                      </div>
                      <div
                        className="w-9 h-9 rounded-full border-2 border-indigo-500 overflow-hidden cursor-pointer"
                        onClick={() => handleNavigate('profile')}
                      >
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={() => {
                          localStorage.removeItem('googleUser');
                          setUser(null);
                          addToast('info', 'Logged out successfully');
                          handleNavigate('home');
                        }}
                        className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                        aria-label="Logout"
                        title="Logout"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden bg-white dark:bg-black border-b border-slate-200 dark:border-white/10 overflow-hidden"
              >
                <div className="px-4 pt-2 pb-6 space-y-1">
                  {['home', 'community', 'events', 'projects', 'leaderboard', 'about'].map((section) => (
                    <button
                      key={section}
                      onClick={() => {
                        handleNavigate(section);
                        setIsMenuOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-colors capitalize ${activeSection === section
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-900'
                        }`}
                    >
                      {section}
                    </button>
                  ))}
                  <div className="pt-4 pb-2 flex flex-col gap-3 px-4 border-t border-slate-100 dark:border-white/10 mt-2">
                    {!user ? (
                      <div className="flex justify-center w-full">
                        <GoogleLogin
                          clientId={GOOGLE_CLIENT_ID}
                          onLoginSuccess={(userData) => {
                            setUser(userData);
                            addToast('success', `Welcome back, ${userData.name}!`);
                            setIsMenuOpen(false);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => {
                            handleNavigate('profile');
                            setIsMenuOpen(false);
                          }}
                        >
                          <div className="w-10 h-10 rounded-full border-2 border-indigo-500 overflow-hidden">
                            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white leading-none mb-1">{user.name}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{user.email}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            localStorage.removeItem('googleUser');
                            setUser(null);
                            addToast('info', 'Logged out successfully');
                            handleNavigate('home');
                            setIsMenuOpen(false);
                          }}
                          className="p-2 rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                          aria-label="Logout"
                          title="Logout"
                        >
                          <LogOut className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>

      {/* Main Content Area */}
      <main className="flex-1 pt-16">
        {renderSection()}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-black py-16 transition-colors duration-300 relative border-t border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-8 mb-20">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">CampusConnect</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm leading-relaxed">
                Empowering the next generation of innovators through project collaboration and sharing.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <a href="https://github.com/Yathindra-mestha" target="_blank" rel="noopener noreferrer" className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:contact@campusconnect.com" className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider">
              © {new Date().getFullYear()} CampusConnect. All rights reserved.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest">Privacy Policy</a>
              <a href="#" className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest">Terms of Service</a>
            </div>
          </div>
        </div>

        {/* Floating Scroll to Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center shadow-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all transform hover:-translate-y-1 z-40 group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </footer>
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        setActiveSection={handleNavigate}
        setSelectedUserForProfile={(u) => handleNavigate('profile', u?.login)}
      />

    </div>
  );
};

// Helper Components

// Imported components instead.
export default App;
