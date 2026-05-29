import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckSquare, 
  BarChart2, 
  Settings, 
  Plus, 
  Calendar,
  Layers,
  Search,
  Bell,
  User,
  Quote,
  Trophy
} from 'lucide-react';
import { 
  getWeekDates, 
  formatDateKey, 
  formatReadableDate 
} from './utils/dateUtils';
import StatsSummary from './components/StatsSummary';
import HabitGrid from './components/HabitGrid';
import AddHabitModal from './components/AddHabitModal';
import ProgressView from './components/ProgressView';
import SettingsView from './components/SettingsView';

export default function App() {
  // Navigation View: 'today' | 'progress' | 'settings'
  const [activeView, setActiveView] = useState('today');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Date Management
  const [referenceDate, setReferenceDate] = useState(new Date());
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Core Habit Tracker States
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});

  // 1. Initial State Loading & Storage Syncing
  useEffect(() => {
    const storedHabits = localStorage.getItem('habitflow_habits');
    const storedCompletions = localStorage.getItem('habitflow_completions');

    if (storedHabits) {
      setHabits(JSON.parse(storedHabits));
    }
    if (storedCompletions) {
      setCompletions(JSON.parse(storedCompletions));
    }
  }, []);

  // Compute 7 days Mon-Sun of current reference week
  const weekDates = useMemo(() => {
    return getWeekDates(referenceDate);
  }, [referenceDate]);

  // Filter habits visible in this week (createdAt <= Sunday of reference week, OR has completion data in this week)
  const visibleHabits = useMemo(() => {
    let filtered = habits;
    
    // Apply search filter if query exists
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(h => h.name.toLowerCase().includes(q));
    }

    if (weekDates.length < 7) return filtered;
    const sundayStr = formatDateKey(weekDates[6]);
    const weekDateStrings = weekDates.map((d) => formatDateKey(d));
    
    return filtered.filter((habit) => {
      // 1. If it has completion data for this week, always show it
      const habitCompletions = completions[habit.id] || [];
      const hasCompletionsThisWeek = weekDateStrings.some((dStr) => habitCompletions.includes(dStr));
      if (hasCompletionsThisWeek) return true;

      // 2. Otherwise, check creation date boundary
      if (!habit.createdAt) return true;
      const createdDateStr = formatDateKey(new Date(habit.createdAt));
      return sundayStr >= createdDateStr;
    });
  }, [habits, completions, weekDates, searchQuery]);

  // 2. State Mutation Handlers
  const handleAddHabit = (name, category = 'FITNESS') => {
    const newHabit = {
      id: `habit-${Date.now()}`,
      name,
      category,
      createdAt: new Date().toISOString()
    };
    
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    localStorage.setItem('habitflow_habits', JSON.stringify(updatedHabits));
  };

  const handleToggleHabit = (habitId, dateStr) => {
    const updatedCompletions = { ...completions };
    const dateList = updatedCompletions[habitId] || [];

    if (dateList.includes(dateStr)) {
      // Remove completion
      updatedCompletions[habitId] = dateList.filter((d) => d !== dateStr);
    } else {
      // Add completion
      updatedCompletions[habitId] = [...dateList, dateStr];
    }

    setCompletions(updatedCompletions);
    localStorage.setItem('habitflow_completions', JSON.stringify(updatedCompletions));
  };

  const handleRenameHabit = (habitId, newName) => {
    const updatedHabits = habits.map((habit) => 
      habit.id === habitId ? { ...habit, name: newName } : habit
    );
    setHabits(updatedHabits);
    localStorage.setItem('habitflow_habits', JSON.stringify(updatedHabits));
  };

  const handleDeleteHabit = (habitId) => {
    // Remove habit
    const updatedHabits = habits.filter((habit) => habit.id !== habitId);
    setHabits(updatedHabits);
    localStorage.setItem('habitflow_habits', JSON.stringify(updatedHabits));

    // Cleanup completions
    const updatedCompletions = { ...completions };
    delete updatedCompletions[habitId];
    setCompletions(updatedCompletions);
    localStorage.setItem('habitflow_completions', JSON.stringify(updatedCompletions));
  };

  const handleResetData = () => {
    setHabits([]);
    setCompletions({});
    localStorage.removeItem('habitflow_habits');
    localStorage.removeItem('habitflow_completions');
  };

  // 3. Weekly Navigation Handlers
  const handlePrevWeek = () => {
    const prev = new Date(referenceDate);
    prev.setDate(prev.getDate() - 7);
    setReferenceDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(referenceDate);
    next.setDate(next.getDate() + 7);
    setReferenceDate(next);
  };

  const handleJumpToToday = () => {
    setReferenceDate(new Date());
  };

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col font-sans select-none">
      
      {/* 1. TOP NAVBAR */}
      <header className="h-16 border-b border-dark-border bg-dark-sidebar flex items-center justify-between px-6 shrink-0 z-10">
        
        {/* App Title & Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('today')}>
          <div className="h-9 w-9 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-gray-950 text-lg shadow-md select-none">
            H
          </div>
          <span className="text-lg font-bold font-display tracking-tight text-white">HabitFlow</span>
        </div>

        {/* Centered Search Bar */}
        <div className="relative max-w-md w-full mx-8 hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder={
              activeView === 'today' 
                ? "Search habits..." 
                : activeView === 'progress' 
                  ? "Search insights..." 
                  : "Search settings..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-dark-hover border border-dark-border/60 rounded-full text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-all font-sans"
          />
        </div>

        {/* Right Shortcuts */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-dark-hover rounded-lg transition-colors cursor-pointer relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
          </button>
          
          <button 
            onClick={() => setActiveView('settings')}
            className={`p-2 rounded-lg transition-colors cursor-pointer border ${
              activeView === 'settings' 
                ? 'bg-brand-900/20 border-brand-500/30 text-brand-400' 
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-dark-hover'
            }`}
            title="Settings"
          >
            <Settings size={18} />
          </button>

          <div className="h-8 w-px bg-dark-border mx-1" />

          <button className="h-8 w-8 rounded-full bg-dark-hover border border-dark-border flex items-center justify-center text-gray-400 hover:text-gray-200 cursor-pointer overflow-hidden">
            <User size={16} />
          </button>
        </div>
      </header>

      {/* 2. BODY SHELL */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-64 border-r border-dark-border bg-dark-sidebar flex flex-col justify-between hidden md:flex shrink-0 p-4">
          
          <div className="space-y-6">
            <div className="pl-3">
              <span className="text-[11px] font-black text-brand-500 tracking-widest uppercase select-none font-display">
                Growth through Clarity
              </span>
            </div>

            <nav className="space-y-1.5">
              
              {/* TODAY TAB */}
              <button
                onClick={() => setActiveView('today')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeView === 'today'
                    ? 'bg-brand-500 text-dark-bg hover:bg-brand-400 shadow-sm shadow-brand-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-dark-hover/40'
                }`}
              >
                <Calendar size={18} />
                <span>Today</span>
              </button>

              {/* PROGRESS TAB */}
              <button
                onClick={() => setActiveView('progress')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeView === 'progress'
                    ? 'bg-brand-500 text-dark-bg hover:bg-brand-400 shadow-sm shadow-brand-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-dark-hover/40'
                }`}
              >
                <BarChart2 size={18} />
                <span>Progress</span>
              </button>

              {/* SETTINGS TAB */}
              <button
                onClick={() => setActiveView('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeView === 'settings'
                    ? 'bg-brand-500 text-dark-bg hover:bg-brand-400 shadow-sm shadow-brand-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-dark-hover/40'
                }`}
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer + Floating Action */}
          <div className="space-y-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-500 hover:bg-brand-400 text-dark-bg font-bold rounded-xl text-sm shadow-md transition-all duration-200 hover:scale-[1.01] emerald-glow-sm cursor-pointer"
            >
              <Plus size={16} strokeWidth={3} />
              New Habit
            </button>

            <div className="p-3 border border-dark-border rounded-xl bg-dark-bg/20 text-center">
              <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                HABITFLOW V1.0.0
              </p>
            </div>
          </div>
        </aside>

        {/* 3. MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 pb-24 md:pb-16 bg-dark-bg relative">
          
          {/* TAB 1: TODAYVIEW */}
          {activeView === 'today' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              
              {/* Today View Header Block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-display text-gray-100">Today's Habits</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {formatReadableDate(referenceDate)}
                  </p>
                </div>
              </div>

              {/* Three Stat Cards Summary Component (swapped at the top!) */}
              <StatsSummary 
                habits={visibleHabits}
                completions={completions}
                referenceDate={referenceDate}
              />

              {/* Two-Column Grid: Left: Weekly Tracker, Right: Decorative quote & milestone cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
                
                {/* Checkboxes Grid Component (Left 2/3 width) */}
                <div className="lg:col-span-8">
                  <HabitGrid 
                    habits={visibleHabits}
                    completions={completions}
                    onToggle={handleToggleHabit}
                    weekDates={weekDates}
                    onPrevWeek={handlePrevWeek}
                    onNextWeek={handleNextWeek}
                    onJumpToToday={handleJumpToToday}
                    referenceDate={referenceDate}
                  />
                </div>

                {/* Right Panel Stack (Right 1/3 width) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Quote Card (Solid Emerald Accent) */}
                  <div className="bg-brand-500 text-dark-bg p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-level-1 h-52">
                    <Quote size={80} className="absolute right-4 bottom-2 text-brand-600/20 font-bold pointer-events-none" strokeWidth={1} />
                    <span className="text-4xl font-serif font-black leading-none opacity-40 select-none">“</span>
                    <p className="text-sm font-semibold italic mt-1 leading-relaxed z-10">
                      "Success is the sum of small efforts, repeated day in and day out."
                    </p>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest mt-4 block z-10">
                      — ROBERT COLLIER
                    </span>
                  </div>

                  {/* Milestone Card */}
                  <div className="bg-dark-card border border-dark-border p-5 rounded-3xl shadow-level-1 flex flex-col gap-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Milestone Near</h4>
                    
                    <div className="flex items-center gap-3 bg-dark-bg/40 border border-dark-border/40 p-4.5 rounded-2xl">
                      <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-xl">
                        <Trophy size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-200 font-display">30 Day Streak</p>
                        <p className="text-xs text-gray-400 mt-0.5">Only 6 days to go!</p>
                      </div>
                    </div>
                    
                    {/* Progress Slider */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-dark-bg border border-dark-border rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PROGRESSVIEW */}
          {activeView === 'progress' && (
            <div className="max-w-5xl mx-auto">
              <ProgressView 
                habits={habits}
                completions={completions}
                weekDates={weekDates}
              />
            </div>
          )}

          {/* TAB 3: SETTINGSVIEW */}
          {activeView === 'settings' && (
            <div className="max-w-5xl mx-auto">
              <SettingsView 
                habits={habits}
                onRenameHabit={handleRenameHabit}
                onDeleteHabit={handleDeleteHabit}
                onResetData={handleResetData}
                onAddHabit={handleAddHabit}
              />
            </div>
          )}

          {/* Floating Circle Add Button in bottom right corner (for Today view) */}
          {activeView === 'today' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-brand-500 text-dark-bg flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer md:hidden z-30 emerald-glow"
              aria-label="Add Habit"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          )}

        </main>
      </div>

      {/* MOBILE FOOTER NAVBAR */}
      <footer className="h-14 border-t border-dark-border bg-dark-sidebar flex items-center justify-around md:hidden shrink-0">
        <button 
          onClick={() => setActiveView('today')} 
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold w-16 transition-colors ${
            activeView === 'today' ? 'text-brand-500 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calendar size={18} />
          Today
        </button>
        <button 
          onClick={() => setActiveView('progress')} 
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold w-16 transition-colors ${
            activeView === 'progress' ? 'text-brand-500 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <BarChart2 size={18} />
          Progress
        </button>
        <button 
          onClick={() => setActiveView('settings')} 
          className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold w-16 transition-colors ${
            activeView === 'settings' ? 'text-brand-500 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Settings size={18} />
          Settings
        </button>
      </footer>

      {/* ADD HABIT DIALOG OVERLAY */}
      <AddHabitModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddHabit}
      />

    </div>
  );
}
