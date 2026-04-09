"use client";

import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from './lib/api';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ workouts: 0, routines: 0, sessions: [], chartData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        const [workoutsRes, routinesRes, sessionsRes] = await Promise.all([
          api.get('/workouts/'),
          api.get('/routines/'),
          api.get('/sessions/')
        ]);
        
        const sessionsData = sessionsRes.data || [];
        const formattedChartData = [...sessionsData].reverse().map(s => ({
            name: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            volume: s.total_volume
        }));

        setStats({
          workouts: workoutsRes.data.length || 0,
          routines: routinesRes.data.length || 0,
          sessions: sessionsData,
          chartData: formattedChartData
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  if (!user) {
     return (
        <div className="min-h-full flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-24 bg-[var(--color-background)] relative overflow-hidden">
          {/* Decorative blurred background blobs */}
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[var(--color-primary)] rounded-full blur-[120px] opacity-10 animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[var(--color-secondary)] rounded-full blur-[100px] opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
            {/* Text Content */}
            <div className="text-left animate-fade-in">
              <div className="inline-block px-4 py-1.5 rounded-full bg-[rgba(0,53,71,0.1)] dark:bg-[rgba(194,187,0,0.1)] text-[var(--color-primary)] dark:text-[var(--color-tertiary)] font-bold text-sm mb-6 border border-[rgba(0,53,71,0.2)] dark:border-[rgba(194,187,0,0.2)]">
                ✨ Unlock Your Ultimate Potential
              </div>
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black mb-6 text-[var(--color-primary)] dark:text-[var(--color-tertiary)] tracking-tighter leading-[1.05]">
                Track Everything.<br/>
                <span className="text-[var(--color-foreground)]">Achieve Anything.</span>
              </h1>
              <p className="text-[var(--color-muted)] text-xl sm:text-2xl mb-10 font-medium max-w-xl leading-relaxed">
                The simplest, most effective way to build routines and log your progress. 
                Zero complex features—just you and your gains.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={() => router.push('/register')} 
                  className="group relative w-full sm:w-auto px-10 py-5 bg-[var(--color-primary)] text-white rounded-2xl font-black text-lg overflow-hidden shadow-[0_10px_35px_rgba(0,53,71,0.3)] hover:shadow-[0_15px_45px_rgba(0,53,71,0.4)] transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Start for Free
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </button>
                <button 
                  onClick={() => router.push('/login')} 
                  className="w-full sm:w-auto px-10 py-5 bg-transparent border-2 border-gray-300 dark:border-gray-700 hover:border-[var(--color-primary)] dark:hover:border-[var(--color-tertiary)] rounded-2xl font-bold text-lg text-[var(--color-foreground)] transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] hover:bg-[rgba(0,53,71,0.05)] dark:hover:bg-[rgba(194,187,0,0.05)]"
                >
                  Log In
                </button>
              </div>
            </div>

            {/* Visual/Image Content */}
            <div className="relative group mt-10 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] rounded-[2.5rem] transform rotate-3 scale-105 opacity-20 blur-xl group-hover:rotate-6 group-hover:scale-110 group-hover:opacity-30 transition-all duration-700"></div>
              <div className="relative transform transition-all duration-700 group-hover:-translate-y-2 group-hover:rotate-[1deg]">
                <img 
                  src="/hero.png" 
                  alt="Workout App Interface" 
                  className="w-full h-auto object-cover rounded-[2.5rem] shadow-2xl border-8 border-white dark:border-gray-800"
                />
                
                {/* Floating summary card */}
                <div className="absolute -bottom-6 -left-4 sm:-left-8 bg-white dark:bg-[var(--color-surface)] p-4 sm:p-5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide">Volume Mover</p>
                        <p className="text-lg sm:text-xl font-black text-[var(--color-foreground)]">3,450 kg</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
     );
  }

  // Dashboard View
  return (
    <div className="min-h-full flex-1 p-6 sm:p-10 bg-[var(--color-background)]">
       <div className="max-w-5xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-black mb-1 text-[var(--color-primary)] dark:text-[var(--color-tertiary)] tracking-tight">Dashboard</h1>
          <p className="text-[var(--color-muted)] font-medium mb-8">Welcome back, {user.username}. Here is your overview.</p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-10">
             {/* Stat Card 1 */}
             <div className="human-panel p-8 flex items-center justify-between transition-colors border-2 border-transparent hover:border-[var(--color-primary)]">
                <div>
                  <p className="text-[var(--color-muted)] font-bold text-sm uppercase tracking-wider mb-2">Total Workouts</p>
                  <p className="text-5xl font-black text-[var(--color-foreground)]">{loading ? '-' : stats.workouts}</p>
                </div>
                {/* <div className="w-16 h-16 rounded-2xl bg-[rgba(0,53,71,0.1)] dark:bg-[rgba(194,187,0,0.1)] flex items-center justify-center text-[var(--color-primary)] dark:text-[var(--color-tertiary)]"> */}
                  {/* <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12M6 20h12M12 4v16M4 8h16M4 16h16" /></svg> */}
                {/* </div> */}
             </div>

             {/* Stat Card 2 */}
             <div className="human-panel p-8 flex items-center justify-between transition-colors border-2 border-transparent hover:border-[var(--color-warning)]">
                <div>
                  <p className="text-[var(--color-muted)] font-bold text-sm uppercase tracking-wider mb-2">Saved Routines</p>
                  <p className="text-5xl font-black text-[var(--color-foreground)]">{loading ? '-' : stats.routines}</p>
                </div>
                {/* <div className="w-16 h-16 rounded-2xl bg-[rgba(237,139,22,0.1)] flex items-center justify-center text-[var(--color-warning)]"> */}
                   {/* <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h7" /></svg> */}
                {/* </div> */}
             </div>
          </div>

          <h2 className="text-xl font-bold mb-4 text-[var(--color-foreground)]">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-5 mb-10">
              <Link href="/workouts" className="group human-panel p-6 flex items-center gap-5 border-2 border-transparent hover:bg-primary transition-all duration-300">
                  <div className="bg-gray-100 dark:bg-gray-800 group-hover:bg-[rgba(149,60,60,0.2)] rounded-full p-4 transition-colors">
                     <svg width="24" height="24" className="text-[var(--color-primary)] dark:text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                  </div>
                  <div className="group-hover:text-amber">
                      <p className="font-bold text-lg mb-0.5">Create a Workout</p>
                      <p className="text-sm text-[var(--color-muted)] group-hover:text-[rgba(140,30,30,0.7)]">Add a new exercise to your library</p>
                  </div>
              </Link>
              
              <Link href="/routines" className="group human-panel p-6 flex items-center gap-5 border-2 border-transparent hover:bg-secondary transition-all duration-300">
                  <div className="bg-gray-100 dark:bg-gray-800 group-hover:bg-[rgba(183,55,55,0.2)] rounded-full p-4 transition-colors">
                     <svg width="24" height="24" className="text-[var(--color-secondary)] dark:text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                  </div>
                  <div className="group-hover:text-amber">
                      <p className="font-bold text-lg mb-0.5">Build a Routine</p>
                      <p className="text-sm text-[var(--color-muted)] group-hover:text-[rgba(210,67,67,0.7)]">Group your workouts together</p>
                  </div>
              </Link>
          </div>

          <h2 className="text-xl font-bold mb-4 text-[var(--color-foreground)]">Volume Over Time</h2>
          <div className="human-panel p-6 sm:p-8 mb-10 h-[350px] w-full">
              {loading ? (
                  <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                  </div>
              ) : stats.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" minHeight={300}>
                      <LineChart data={stats.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                          <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}kg`} />
                          <Tooltip 
                              contentStyle={{ backgroundColor: 'var(--color-surface)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                              itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                          />
                          <Line type="monotone" dataKey="volume" stroke="var(--color-primary)" strokeWidth={4} dot={{ r: 5, fill: 'var(--color-secondary)' }} activeDot={{ r: 8 }} />
                      </LineChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-[var(--color-muted)] font-medium">No workout data to visualize yet.</p>
                      <p className="text-sm text-[var(--color-muted)] mt-1">Start tracking routines to see your volume graph build over time.</p>
                  </div>
              )}
          </div>
       </div>
    </div>
  );
}