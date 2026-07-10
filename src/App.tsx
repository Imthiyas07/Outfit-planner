/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, ClothingItem, Outfit, PlannedOutfit } from './types';
import AuthPage from './components/AuthPage';
import Wardrobe from './components/Wardrobe';
import Outfits from './components/Outfits';
import CalendarView from './components/CalendarView';
import Profile from './components/Profile';
import DeveloperExport from './components/DeveloperExport';

import { 
  Shirt, LayoutDashboard, Tags, FolderHeart, Calendar, User as UserIcon, 
  Terminal, LogOut, Menu, X, Plus, Sparkles, CalendarDays, ArrowRight, Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'dashboard' | 'wardrobe' | 'outfits' | 'calendar' | 'profile' | 'export';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [plannedOutfits, setPlannedOutfits] = useState<PlannedOutfit[]>([]);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check auth on load
  useEffect(() => {
    const storedToken = localStorage.getItem('outfit_planner_token');
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch application records when authenticated
  useEffect(() => {
    if (token && user) {
      fetchAppData();
    }
  }, [token, user]);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Stale or invalid token
        handleLogout();
      }
    } catch (error) {
      console.error("Failed to authenticate with backend:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppData = async () => {
    if (!token) return;
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [clothesRes, outfitsRes, calendarRes] = await Promise.all([
        fetch('/api/clothes', { headers }),
        fetch('/api/outfits', { headers }),
        fetch('/api/calendar', { headers })
      ]);

      if (clothesRes.ok) setClothes(await clothesRes.json());
      if (outfitsRes.ok) setOutfits(await outfitsRes.json());
      if (calendarRes.ok) setPlannedOutfits(await calendarRes.json());
    } catch (err) {
      console.error("Failed loading closet records:", err);
    }
  };

  const handleAuthSuccess = (authUser: User, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem('outfit_planner_token', authToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('outfit_planner_token');
    setActiveTab('dashboard');
  };

  // Get today's scheduled outfit
  const getTodayPlan = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const plan = plannedOutfits.find(p => p.date === todayStr);
    if (!plan) return null;
    const outfit = outfits.find(o => o.id === plan.outfitId);
    return { plan, outfit };
  };

  const todayPlanInfo = getTodayPlan();

  // Get hours for dynamic greeting card
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 animate-spin absolute top-0 left-0 opacity-10"></div>
          <Shirt className="w-12 h-12 text-slate-950 animate-bounce relative z-10" />
        </div>
        <p className="text-xs text-slate-450 font-bold uppercase tracking-widest mt-4 animate-pulse">
          Opening Wardrobe...
        </p>
      </div>
    );
  }

  if (!user || !token) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'wardrobe', label: 'My Wardrobe', icon: <Tags className="w-4 h-4" /> },
    { id: 'outfits', label: 'Outfit Combinations', icon: <FolderHeart className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar Planner', icon: <Calendar className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile & Stats', icon: <UserIcon className="w-4 h-4" /> },
    { id: 'export', label: 'Java/MySQL Code', icon: <Terminal className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900 font-sans">
      
      {/* LEFT SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-64 bg-white text-slate-600 flex-col justify-between p-6 border-r border-slate-200 flex-shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3.5 px-2 py-1">
            <div className="p-1.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-150">
              <Shirt className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold text-slate-950 tracking-tight">OUTFITLY</span>
          </div>

          {/* User Brief profile card */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-250 border border-slate-200 flex-shrink-0">
              <img src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-950 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">@{user.username}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === item.id 
                    ? 'bg-slate-100 text-slate-950 font-bold' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Log Out button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer mt-10"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* TOP HEADER (Mobile) */}
      <header className="lg:hidden bg-white text-slate-900 p-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-150">
            <Shirt className="w-4.5 h-4.5" />
          </div>
          <span className="text-sm font-bold text-slate-950">OUTFITLY</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 bg-slate-50 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      {/* MOBILE NAV OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 z-40 relative text-slate-600"
          >
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as TabType);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                  activeTab === item.id 
                    ? 'bg-slate-100 text-slate-950 font-bold' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'dashboard' && (
              <div className="space-y-6" id="dashboard-tab">
                {/* Greeting Hero Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl"></div>
                  <div className="space-y-2 relative z-10">
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> Virtual Wardrobe Active
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                      {getGreeting()}, {user.name}!
                    </h2>
                    <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                      Your virtual apparel catalog is running smoothly. Mix garments, design outfits, and schedule your looks on the calendar timeline.
                    </p>
                  </div>

                  <div className="flex gap-3 relative z-10">
                    <button
                      onClick={() => setActiveTab('wardrobe')}
                      className="bg-black hover:bg-slate-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                    >
                      Open Closet
                    </button>
                    <button
                      onClick={() => setActiveTab('calendar')}
                      className="bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                    >
                      Plan Days
                    </button>
                  </div>
                </div>

                {/* Dashboard Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <Shirt className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Garments Owned</span>
                      <span className="text-lg font-bold text-slate-900 mt-0.5 block">{clothes.length} items</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <FolderHeart className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outfit Combinations</span>
                      <span className="text-lg font-bold text-slate-900 mt-0.5 block">{outfits.length} sets</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scheduled Plans</span>
                      <span className="text-lg font-bold text-slate-900 mt-0.5 block">{plannedOutfits.length} days</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Today's Look Panel */}
                  <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5 border-b border-slate-100 pb-3">
                        <Clock className="w-4.5 h-4.5 text-blue-600" />
                        Today's Scheduled Look
                      </h3>
                      
                      {todayPlanInfo && todayPlanInfo.outfit ? (
                        <div className="mt-4 space-y-4">
                          <div>
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                              {todayPlanInfo.outfit.name}
                            </span>
                            {todayPlanInfo.plan.note && (
                              <p className="text-xs text-slate-500 mt-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                "{todayPlanInfo.plan.note}"
                              </p>
                            )}
                          </div>

                          {/* Render Outfit Clothes */}
                          <div className="grid grid-cols-4 gap-3 pt-2">
                            {todayPlanInfo.outfit.clothingIds
                              .map(id => clothes.find(c => c.id === id))
                              .filter((c): c is ClothingItem => !!c)
                              .map(c => (
                                <div key={c.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 text-center">
                                  <div className="aspect-[4/5]">
                                    <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="p-1.5">
                                    <p className="text-[9px] font-bold text-slate-800 truncate">{c.name}</p>
                                    <p className="text-[7px] text-slate-400 uppercase mt-0.5 font-semibold">{c.category}</p>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center space-y-3">
                          <p className="text-xs text-slate-500">No layout scheduled on your calendar for today!</p>
                          <button
                            onClick={() => setActiveTab('calendar')}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all cursor-pointer"
                          >
                            Schedule Today's Outfit <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Wardrobe Quick Access */}
                  <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
                        <Plus className="w-4.5 h-4.5 text-blue-600" />
                        Quick Wardrobe View
                      </h3>

                      {clothes.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-500">
                          Your wardrobe is empty. Go to the Wardrobe tab to register clothes!
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2.5">
                          {clothes.slice(0, 6).map(item => (
                            <div key={item.id} className="aspect-[4/5] rounded-xl border border-slate-200 overflow-hidden relative group">
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white py-0.5 text-center truncate px-1">
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {clothes.length > 0 && (
                      <button
                        onClick={() => setActiveTab('wardrobe')}
                        className="mt-4 w-full text-center text-xs font-bold text-slate-600 border border-slate-200 py-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        Manage Wardrobe ({clothes.length} items)
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'wardrobe' && (
              <Wardrobe 
                clothes={clothes} 
                token={token} 
                onClothesChange={fetchAppData} 
              />
            )}

            {activeTab === 'outfits' && (
              <Outfits 
                outfits={outfits} 
                clothes={clothes} 
                token={token} 
                onOutfitsChange={fetchAppData} 
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView 
                plannedOutfits={plannedOutfits} 
                outfits={outfits} 
                clothes={clothes} 
                token={token} 
                onCalendarChange={fetchAppData} 
              />
            )}

            {activeTab === 'profile' && (
              <Profile 
                user={user} 
                clothes={clothes} 
                outfits={outfits} 
                plannedOutfits={plannedOutfits} 
                token={token} 
                onProfileChange={(updatedUser) => setUser(updatedUser)} 
              />
            )}

            {activeTab === 'export' && (
              <DeveloperExport />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
