import React from 'react';
import { 
  CheckSquare, 
  Flame, 
  BarChart2, 
  Trophy 
} from 'lucide-react';
import { formatDateKey, getStreak } from '../utils/dateUtils';

export default function StatsSummary({ habits, completions, referenceDate }) {
  const todayStr = formatDateKey(referenceDate);
  const totalHabits = habits.length;

  // 1. Today's completions
  let completedTodayCount = 0;
  if (totalHabits > 0) {
    habits.forEach((habit) => {
      const dates = completions[habit.id] || [];
      if (dates.includes(todayStr)) {
        completedTodayCount++;
      }
    });
  }
  const todayPercentage = totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;

  // 2. Best current streak
  let bestStreak = 0;
  let bestHabitName = 'No active habits';

  if (totalHabits > 0) {
    habits.forEach((habit) => {
      const dates = completions[habit.id] || [];
      const streak = getStreak(dates, formatDateKey(new Date())); // Calculate streak based on actual current date
      if (streak > bestStreak) {
        bestStreak = streak;
        bestHabitName = habit.name;
      }
    });
    if (bestStreak === 0) {
      bestHabitName = 'None active';
    }
  }

  // 3. This week's completion percentage (counting only Monday up to and including today)
  const referenceDateObj = new Date(referenceDate);
  const day = referenceDateObj.getDay();
  const diff = referenceDateObj.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(referenceDateObj.setDate(diff));
  
  const weekDateStrings = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    weekDateStrings.push(formatDateKey(nextDay));
  }

  const todayDateStr = formatDateKey(new Date());
  let totalWeeklySlots = 0;
  let completedWeeklyCount = 0;

  if (totalHabits > 0) {
    weekDateStrings.forEach((dateStr) => {
      if (dateStr <= todayDateStr) {
        habits.forEach((habit) => {
          const createdDateStr = habit.createdAt ? formatDateKey(new Date(habit.createdAt)) : '';
          const dates = completions[habit.id] || [];
          
          if (!createdDateStr || dateStr >= createdDateStr || dates.includes(dateStr)) {
            totalWeeklySlots++;
            if (dates.includes(dateStr)) {
              completedWeeklyCount++;
            }
          }
        });
      }
    });
  }

  const weeklyPercentage = totalWeeklySlots > 0 ? Math.round((completedWeeklyCount / totalWeeklySlots) * 100) : 0;
  const isCurrentWeek = weekDateStrings.includes(todayDateStr);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
      
      {/* 1. Today's / Week's completion Card */}
      <div className="bg-dark-card border border-dark-border p-6 rounded-3xl transition-all duration-300 hover:border-brand-500/30 shadow-level-1 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
            {isCurrentWeek ? "Today's completion" : "Week completion"}
          </p>
          <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-xl">
            <CheckSquare size={16} />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black font-display text-gray-100">
            {isCurrentWeek 
              ? `${completedTodayCount} / ${totalHabits}` 
              : `${completedWeeklyCount} / ${totalWeeklySlots}`
            }
          </span>
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Habits
          </span>
        </div>

        {/* Horizontal progress bar */}
        <div className="mt-4 space-y-1">
          <div className="h-1.5 w-full bg-dark-bg border border-dark-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-500 rounded-full transition-all duration-500" 
              style={{ width: `${totalHabits > 0 ? (isCurrentWeek ? todayPercentage : weeklyPercentage) : 0}%` }} 
            />
          </div>
          <p className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider mt-1 block">
            {totalHabits > 0 
              ? `${isCurrentWeek ? todayPercentage : weeklyPercentage}% done` 
              : 'No habits added'
            }
          </p>
        </div>
      </div>

      {/* 2. Longest Streak Card */}
      <div className="bg-dark-card border border-dark-border p-6 rounded-3xl transition-all duration-300 hover:border-brand-500/30 shadow-level-1 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Longest streak</p>
          <div className="p-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl">
            <Flame size={16} fill="currentColor" className="animate-pulse" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black font-display text-gray-100">
            {bestStreak}
          </span>
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            {bestStreak === 1 ? 'day' : 'days'}
          </span>
        </div>

        <div className="mt-4 space-y-1">
          <div className="text-xs font-bold text-gray-300 truncate" title={bestHabitName}>
            {bestHabitName}
          </div>
          <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest block">
            CURRENT RECORD
          </p>
        </div>
      </div>

      {/* 3. Weekly Progress Card (with status micro-chart dots!) */}
      <div className="bg-dark-card border border-dark-border p-6 rounded-3xl transition-all duration-300 hover:border-brand-500/30 shadow-level-1 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Weekly Progress</p>
          <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-xl">
            <BarChart2 size={16} />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black font-display text-gray-100">
            {weeklyPercentage}%
          </span>
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            completed
          </span>
        </div>

        {/* Micro-chart status dots for 7 days */}
        <div className="mt-4 space-y-1.5">
          <div className="flex gap-1.5">
            {weekDateStrings.map((dateStr, idx) => {
              // Any completions on this date
              const isCompleted = habits.some(h => (completions[h.id] || []).includes(dateStr));
              return (
                <div 
                  key={idx}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-brand-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                      : 'bg-dark-bg border border-dark-border/80'
                  }`}
                  title={`${dateStr}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[8px] text-gray-500 font-black tracking-widest uppercase">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>
        </div>
      </div>

    </div>
  );
}
