import React, { useState, useEffect, useMemo } from 'react';
import { githubService } from '../utils/github';
import { Trophy, Medal, Star, Search, Filter, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { optimizeImage } from '../utils/imageOptimization';

interface LeaderboardProps {
  setActiveSection: (section: string) => void;
  setSelectedUserForProfile: (user: any) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ setActiveSection, setSelectedUserForProfile }) => {
  const [timeframe, setTimeframe] = useState('all-time');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');

  const isOnline = (lastActive?: string) => {
    if (!lastActive) return false;
    const lastActiveDate = new Date(lastActive);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastActiveDate > fiveMinutesAgo;
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await githubService.getLeaderboard();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleUserClick = (user: any) => {
    setSelectedUserForProfile({
      login: user.login || user.name.toLowerCase().replace(' ', '-'),
      name: user.name,
      avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
      branch: user.branch
    });
    setActiveSection('profile');
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.login.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBranch = branchFilter === 'all' ||
        user.branch.toLowerCase().includes(branchFilter.toLowerCase());
      return matchesSearch && matchesBranch;
    });
  }, [users, searchQuery, branchFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Calculating real-time rankings...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Trophy className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No rankings available yet</h2>
        <p className="text-slate-500 max-w-sm">Students need to upload projects or complete their profiles to appear on the leaderboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500 fill-amber-500" />
            Global Leaderboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Top contributors across all domains based on projects, solutions, and engagement.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setTimeframe('this-week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeframe === 'this-week' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('this-month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeframe === 'this-month' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeframe('all-time')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeframe === 'all-time' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-2 md:gap-8 mb-12 items-end max-w-4xl mx-auto mt-16 px-2 sm:px-0">
        {/* Rank 2 */}
        {filteredUsers[1] && (
          <div className="flex flex-col items-center cursor-pointer group" onClick={() => handleUserClick(filteredUsers[1])}>
            <div className="relative mb-2 md:mb-4 transition-transform group-hover:scale-105">
              <div className={`w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-slate-200 dark:bg-zinc-800 border-4 border-slate-300 dark:border-white/10 flex items-center justify-center text-lg sm:text-2xl font-bold text-slate-500 shadow-lg z-10 relative overflow-hidden ${isOnline(filteredUsers[1].last_active_at) ? 'ring-2 ring-emerald-500 ring-offset-4 dark:ring-offset-zinc-900' : ''}`}>
                <div className="absolute inset-0 bg-slate-200 dark:bg-white/5 animate-pulse" />
                <img src={optimizeImage(filteredUsers[1].avatar_url, { width: 120 })} alt="" className="w-full h-full object-cover relative z-10" loading="lazy" decoding="async" />
              </div>
              {isOnline(filteredUsers[1].last_active_at) && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full z-30 animate-pulse shadow-sm"></span>
              )}
              <div className="absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 bg-slate-700 dark:bg-black text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border-2 border-white dark:border-white/10 z-20 shadow-sm">
                #2
              </div>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-center text-[10px] sm:text-sm md:text-lg line-clamp-1">{filteredUsers[1].name}</h3>
            <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-500 mb-2">{filteredUsers[1].branch}</p>
            <div className="bg-slate-100 dark:bg-white/5 w-full rounded-t-xl sm:rounded-t-2xl h-24 sm:h-32 md:h-40 flex flex-col items-center justify-start pt-4 sm:pt-6 border-t-4 border-slate-300 dark:border-white/10 shadow-inner">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-sm sm:text-lg md:text-xl">{filteredUsers[1].points.toLocaleString()}</span>
              <span className="text-[10px] sm:text-xs text-slate-500 uppercase font-semibold tracking-wider">Points</span>
            </div>
          </div>
        )}

        {/* Rank 1 */}
        {filteredUsers[0] && (
          <div className="flex flex-col items-center cursor-pointer group" onClick={() => handleUserClick(filteredUsers[0])}>
            <div className="relative mb-2 md:mb-4 transition-transform group-hover:scale-105">
              <div className="absolute -top-7 sm:-top-10 left-1/2 -translate-x-1/2 text-amber-500 z-30 drop-shadow-lg">
                <Medal className="w-8 h-8 sm:w-12 sm:h-12 fill-amber-500" />
              </div>
              <div className={`w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-amber-100 dark:bg-amber-500/10 border-4 border-amber-400 dark:border-amber-500/30 flex items-center justify-center text-xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 shadow-xl z-10 relative overflow-hidden ${isOnline(filteredUsers[0].last_active_at) ? 'ring-4 ring-emerald-500 ring-offset-4 dark:ring-offset-zinc-900' : ''}`}>
                <div className="absolute inset-0 bg-slate-200 dark:bg-white/5 animate-pulse" />
                <img src={optimizeImage(filteredUsers[0].avatar_url, { width: 160 })} alt="" className="w-full h-full object-cover relative z-10" loading="lazy" decoding="async" />
              </div>
              {isOnline(filteredUsers[0].last_active_at) && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full z-30 animate-pulse shadow-sm"></span>
              )}
              <div className="absolute -bottom-3 md:-bottom-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-0.5 sm:px-4 sm:py-1 rounded-full border-2 border-white dark:border-white/10 z-20 shadow-md">
                #1
              </div>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-center text-xs sm:text-base md:text-xl mt-2 line-clamp-1">{filteredUsers[0].name}</h3>
            <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-500 mb-2">{filteredUsers[0].branch}</p>
            <div className="bg-amber-50 dark:bg-amber-500/5 w-full rounded-t-xl sm:rounded-t-2xl h-32 sm:h-40 md:h-48 flex flex-col items-center justify-start pt-4 sm:pt-6 border-t-4 border-amber-400 dark:border-amber-500/20 shadow-inner">
              <span className="font-bold text-amber-600 dark:text-amber-400 text-base sm:text-xl md:text-2xl">{filteredUsers[0].points.toLocaleString()}</span>
              <span className="text-[10px] sm:text-xs text-amber-600/70 dark:text-amber-400/50 uppercase font-semibold tracking-wider">Points</span>
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {filteredUsers[2] && (
          <div className="flex flex-col items-center cursor-pointer group" onClick={() => handleUserClick(filteredUsers[2])}>
            <div className="relative mb-2 md:mb-4 transition-transform group-hover:scale-105">
              <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-orange-100 dark:bg-orange-500/10 border-4 border-orange-300 dark:border-orange-500/20 flex items-center justify-center text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400 shadow-lg z-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-200 dark:bg-white/5 animate-pulse" />
                <img src={optimizeImage(filteredUsers[2].avatar_url, { width: 120 })} alt="" className="w-full h-full object-cover relative z-10" loading="lazy" decoding="async" />
              </div>
              <div className="absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border-2 border-white dark:border-white/10 z-20 shadow-sm">
                #3
              </div>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-center text-[10px] sm:text-sm md:text-lg line-clamp-1">{filteredUsers[2].name}</h3>
            <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-500 mb-2">{filteredUsers[2].branch}</p>
            <div className="bg-orange-50 dark:bg-orange-500/5 w-full rounded-t-xl sm:rounded-t-2xl h-16 sm:h-24 md:h-32 flex flex-col items-center justify-start pt-4 sm:pt-6 border-t-4 border-orange-300 dark:border-orange-500/20 shadow-inner">
              <span className="font-bold text-orange-700 dark:text-orange-400 text-sm sm:text-lg md:text-xl">{filteredUsers[2].points.toLocaleString()}</span>
              <span className="text-[10px] sm:text-xs text-orange-600/70 dark:text-orange-400/50 uppercase font-semibold tracking-wider">Points</span>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full sm:w-auto flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm text-slate-900 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="all">All Branches</option>
              <option value="cse">CSE</option>
              <option value="ece">ECE</option>
              <option value="mech">Mechanical</option>
              <option value="civil">Civil</option>
            </select>
            <button className="px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2 font-medium text-sm shadow-sm">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500 font-semibold">
                <th className="p-4 pl-6 w-16 text-center">Rank</th>
                <th className="p-4">Student</th>
                <th className="p-4 hidden md:table-cell">Branch</th>
                <th className="p-4 hidden sm:table-cell text-center">Projects</th>
                <th className="p-4 pr-6 text-right">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredUsers.slice(3).map((user) => (
                <tr key={user.rank} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.01] transition-colors group cursor-pointer" onClick={() => handleUserClick(user)}>
                  <td className="p-4 pl-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold text-slate-500 dark:text-slate-500">{user.rank}</span>
                      {user.trend === 'up' && <ChevronUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
                      {user.trend === 'down' && <ChevronDown className="w-4 h-4 text-rose-500 dark:text-rose-400" />}
                      {user.trend === 'same' && <div className="w-4 h-0.5 bg-slate-300 dark:bg-zinc-700 rounded-full" />}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-100 dark:border-indigo-500/20 overflow-hidden relative ${isOnline(user.last_active_at) ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900' : ''}`}>
                        <div className="absolute inset-0 bg-slate-200 dark:bg-white/5 animate-pulse" />
                        <img src={optimizeImage(user.avatar_url, { width: 64 })} alt="" className="w-full h-full object-cover relative z-10" loading="lazy" decoding="async" />
                        {isOnline(user.last_active_at) && (
                          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white dark:border-zinc-900 rounded-full"></span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-500 md:hidden">{user.branch}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-slate-600 dark:text-slate-400 text-sm font-medium">
                    {user.branch}
                  </td>
                  <td className="p-4 hidden sm:table-cell text-center text-slate-600 dark:text-slate-400 font-medium">
                    {user.projects}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg font-bold text-slate-700 dark:text-slate-300 border border-transparent dark:border-white/5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {user.points.toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex justify-center">
          <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1">
            Load More <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
