import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart2, 
  Settings, 
  Plus, 
  Calendar
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
    if (weekDates.length < 7) return habits;
    const sundayStr = formatDateKey(weekDates[6]);
    const weekDateStrings = weekDates.map((d) => formatDateKey(d));
    
    return habits.filter((habit) => {
      // 1. If it has completion data for this week, always show it
      const habitCompletions = completions[habit.id] || [];
      const hasCompletionsThisWeek = weekDateStrings.some((dStr) => habitCompletions.includes(dStr));
      if (hasCompletionsThisWeek) return true;

      // 2. Otherwise, check creation date boundary
      if (!habit.createdAt) return true;
      const createdDateStr = formatDateKey(new Date(habit.createdAt));
      return sundayStr >= createdDateStr;
    });
  }, [habits, completions, weekDates]);

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

        {/* Right Shortcuts */}
        <div className="flex items-center gap-2">
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
        </div>
      </header>

      {/* 2. BODY SHELL */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-64 border-r border-dark-border bg-dark-sidebar flex flex-col justify-between hidden md:flex shrink-0 p-4">
          
          <div className="space-y-6">
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

              {/* Weekly Tracker Habit Grid */}
              <div className="mt-6">
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
