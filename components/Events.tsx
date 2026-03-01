import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ExternalLink, Filter, Search, Plus, Trophy, Clock, X, Info } from 'lucide-react';
import { optimizeImage } from '../utils/imageOptimization';
import { githubService } from '../utils/github';

interface EventData {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  participants: number;
  maxParticipants: number;
  image: string;
  description: string;
  winners?: string[] | null;
}

const Events = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
  const [pastEvents, setPastEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await githubService.getEvents();

        // Simple filter based on "Completed" keyword in 'time', or basic date parsing
        const upcoming = events.filter((e: any) => e.time && !e.time.toLowerCase().includes('completed'));
        const past = events.filter((e: any) => e.time && e.time.toLowerCase().includes('completed'));

        setUpcomingEvents(upcoming);
        setPastEvents(past);
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Event Notice Board</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Discover and register for upcoming college events, workshops, and hackathons.</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white transition-all"
          />
        </div>
        <button className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm w-full sm:w-auto">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Upcoming Events Section */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upcoming Events</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {upcomingEvents.map(event => (
            <div key={event.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-lg dark:hover:shadow-white/5 transition-all hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer">
              <div className="h-48 overflow-hidden relative group/image">
                <div className="absolute inset-0 bg-slate-200 dark:bg-zinc-800 animate-pulse" />
                <img src={optimizeImage(event.image, { width: 600 })} alt={event.title} className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover/image:scale-105" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-sm z-20">
                  {event.category}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2">{event.title}</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-6 flex-1">
                  {event.description}
                </p>

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>{event.participants} / {event.maxParticipants} Registered</span>
                    </div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                      {event.maxParticipants - event.participants} spots left
                    </div>
                  </div>

                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm">
                    Register Now <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Events Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 bg-slate-400 dark:bg-slate-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Past Events & Winners</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {pastEvents.map(event => (
            <div key={event.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-lg dark:hover:shadow-white/5 transition-all hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer">
              <div className="h-48 overflow-hidden relative group/image">
                <div className="absolute inset-0 bg-slate-200 dark:bg-zinc-800 animate-pulse" />
                <img src={optimizeImage(event.image, { width: 400 })} alt={event.title} className="w-full h-full object-cover grayscale-[30%] relative z-10 transition-transform duration-700 group-hover/image:scale-105 group-hover/image:grayscale-0" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm z-20">
                  {event.category}
                </div>
                <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 flex items-center justify-center z-10">
                  <span className="bg-slate-900/80 dark:bg-black/80 text-white px-4 py-2 rounded-lg font-bold tracking-wider uppercase text-sm backdrop-blur-sm">
                    Completed
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2">{event.title}</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-6 flex-1">
                  {event.description}
                </p>

                <div className="mt-auto">
                  {event.winners && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                      <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                        <Trophy className="w-4 h-4" />
                        Winners
                      </div>
                      <ul className="text-sm text-amber-900 dark:text-amber-200 space-y-1">
                        {event.winners.map((winner, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="font-bold text-amber-500">{idx + 1}.</span> {winner}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                    View Gallery & Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
