import React from 'react';
import { formatDateKey, getStreak } from '../utils/dateUtils';
import { 
  Award, 
  CheckCircle, 
  TrendingUp, 
  Calendar,
  Dumbbell,
  BookOpen,
  Smile,
  Flame,
  Trophy,
  Layers
} from 'lucide-react';

// Helper to compute the longest streak ever achieved
function getLongestStreakEver(completionDates) {
  if (!completionDates || completionDates.length === 0) return 0;
  
  // Sort dates ascending
  const sorted = [...completionDates].sort((a, b) => new Date(a) - new Date(b));
  let longest = 0;
  let current = 0;
  let lastDate = null;
  
  for (let i = 0; i < sorted.length; i++) {
    const currentDate = new Date(sorted[i] + 'T00:00:00');
    if (lastDate === null) {
      current = 1;
    } else {
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        current++;
      } else if (diffDays > 1) {
        if (current > longest) longest = current;
        current = 1;
      }
    }
    lastDate = currentDate;
  }
  if (current > longest) longest = current;
  return longest;
}

// Category Icon mapping helper
const getCategoryIcon = (category) => {
  switch ((category || '').toUpperCase()) {
    case 'FITNESS':
      return <Dumbbell size={16} />;
    case 'GROWTH':
    case 'LEARN':
      return <BookOpen size={16} />;
    case 'PROJECT':
      return <Layers size={16} />;
    case 'MIND':
    case 'WELLNESS':
      return <Smile size={16} />;
    default:
      return <BookOpen size={16} />;
  }
};

export default function ProgressView({ habits, completions, weekDates }) {
  const totalHabits = habits.length;
  const todayStr = formatDateKey(new Date());

  // 1. General Metrics
  let totalCompletions = 0;
  let absoluteLongestStreak = 0;
  let bestStreakHabitName = 'N/A';

  habits.forEach((habit) => {
    const dates = completions[habit.id] || [];
    totalCompletions += dates.length;
    
    const longestStreak = getLongestStreakEver(dates);
    if (longestStreak > absoluteLongestStreak) {
      absoluteLongestStreak = longestStreak;
      bestStreakHabitName = habit.name;
    }
  });

  // Calculate day-by-day completions for the current week's chart
  const weekDayCompletions = weekDates.map((date) => {
    const dateStr = formatDateKey(date);
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
    let count = 0;
    let activeHabitsForDay = 0;
    
    habits.forEach((habit) => {
      const createdDateStr = habit.createdAt ? formatDateKey(new Date(habit.createdAt)) : '';
      const habitCompletions = completions[habit.id] || [];
      
      if (!createdDateStr || dateStr >= createdDateStr || habitCompletions.includes(dateStr)) {
        activeHabitsForDay++;
        if (habitCompletions.includes(dateStr)) {
          count++;
        }
      }
    });

    const percent = activeHabitsForDay > 0 ? (count / activeHabitsForDay) * 100 : 0;
    return {
      dayLabel,
      dateNum: date.getDate(),
      count,
      percent,
      isToday: dateStr === todayStr
    };
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-gray-100">Progress Report</h2>
        <p className="text-gray-400 text-sm mt-1">Analytics, trends, and lifetime milestones for your habits.</p>
      </div>

      {/* Advanced Milestones Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Checkmarks */}
        <div className="bg-dark-card border border-dark-border p-5 rounded-3xl flex items-center gap-4 shadow-level-1">
          <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-2xl">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Checkmarks</p>
            <p className="text-2xl font-black font-display text-gray-100 mt-0.5">{totalCompletions}</p>
            <p className="text-gray-500 text-[9px] font-extrabold uppercase tracking-wide mt-0.5">Lifetime logged</p>
          </div>
        </div>

        {/* All-Time Best Streak */}
        <div className="bg-dark-card border border-dark-border p-5 rounded-3xl flex items-center gap-4 shadow-level-1">
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl">
            <Award size={20} />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">All-Time Best Streak</p>
            <p className="text-2xl font-black font-display text-gray-100 mt-0.5">
              {absoluteLongestStreak} {absoluteLongestStreak === 1 ? 'day' : 'days'}
            </p>
            <p className="text-gray-500 text-[9px] font-extrabold uppercase tracking-wide truncate max-w-[140px] mt-0.5" title={bestStreakHabitName}>
              {absoluteLongestStreak > 0 ? bestStreakHabitName : 'No streak yet'}
            </p>
          </div>
        </div>

        {/* Active Habit Count */}
        <div className="bg-dark-card border border-dark-border p-5 rounded-3xl flex items-center gap-4 shadow-level-1">
          <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-2xl">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Active Habit Count</p>
            <p className="text-2xl font-black font-display text-gray-100 mt-0.5">{totalHabits}</p>
            <p className="text-gray-500 text-[9px] font-extrabold uppercase tracking-wide mt-0.5">Currently tracking</p>
          </div>
        </div>

      </div>

      {/* Week completions trend bar chart */}
      <div className="bg-dark-card border border-dark-border p-6 rounded-3xl shadow-level-1">
        <h3 className="text-sm font-bold text-gray-200 mb-6 font-display flex items-center gap-2 uppercase tracking-wider">
          <Calendar size={16} className="text-brand-500" />
          Weekly Completion Trends
        </h3>
        
        {totalHabits === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">Add habits to see completion charts.</p>
        ) : (
          <div className="flex justify-between items-end gap-2 h-40 pt-4 px-2 sm:px-6">
            {weekDayCompletions.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 group">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-dark-sidebar border border-dark-border text-[9px] font-bold text-gray-200 px-2 py-1 rounded shadow-md absolute mb-28 text-center font-mono z-10">
                  {day.count} / {totalHabits} done
                </div>
                
                {/* Bar */}
                <div className="w-8 sm:w-12 bg-dark-bg border border-dark-border rounded-t-lg h-28 flex items-end overflow-hidden relative">
                  <div 
                    className={`w-full transition-all duration-500 rounded-t-md ${
                      day.count > 0
                        ? day.isToday
                          ? 'bg-gradient-to-t from-brand-600 to-brand-400 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                          : 'bg-brand-500 hover:bg-brand-400'
                        : 'bg-dark-hover/20'
                    }`} 
                    style={{ height: `${day.percent || 3}%` }} 
                  />
                </div>
                
                {/* Labels */}
                <span className={`text-[11px] font-black mt-2 font-display uppercase tracking-wider ${day.isToday ? 'text-brand-500' : 'text-gray-400'}`}>
                  {day.dayLabel}
                </span>
                <span className={`text-[9px] font-mono font-black ${day.isToday ? 'text-brand-300 font-bold' : 'text-gray-600'}`}>
                  {day.dateNum}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Habits Progress Table / Lists */}
      <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden shadow-level-1">
        <div className="px-5 py-4 border-b border-dark-border bg-dark-sidebar/40">
          <h3 className="text-sm font-bold text-gray-200 font-display uppercase tracking-wider">Habit breakdown</h3>
        </div>
        
        <div className="divide-y divide-dark-border">
          {habits.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No habits found. Add habits to see the analytics breakdown.
            </div>
          ) : (
            habits.map((habit) => {
              const dates = completions[habit.id] || [];
              const totalDaysActive = dates.length;
              const curStreak = getStreak(dates, todayStr);
              const bestStreak = getLongestStreakEver(dates);
              const categoryLabel = (habit.category || 'GROWTH').toUpperCase();
              
              // Calculate completion rating relative to a 30-day target baseline
              const rateVal = Math.min(Math.round((totalDaysActive / 30) * 100), 100);

              return (
                <div key={habit.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-dark-sidebar/10 transition-colors">
                  
                  {/* Left Column: Category Icon, Name, Subtitle, Progress Bar */}
                  <div className="flex-1 flex items-center gap-4">
                    
                    {/* Category Icon */}
                    <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-2xl shrink-0">
                      {getCategoryIcon(habit.category)}
                    </div>
                    
                    {/* Name & custom green progress slider */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm text-gray-200 font-display">
                          {habit.name}
                        </span>
                        <span className="text-[9px] text-gray-500 font-extrabold tracking-widest uppercase font-display">
                          {categoryLabel}
                        </span>
                      </div>
                      
                      {/* Premium Custom Target Slider */}
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-full max-w-sm bg-dark-bg border border-dark-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-500 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.max(rateVal, 4)}%` }} 
                          />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 shrink-0 font-mono tracking-wider">
                          {totalDaysActive} / 30 DAYS
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Premium Pill Badges */}
                  <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto">
                    
                    {/* Current Streak pill badge */}
                    <div className="flex items-center gap-1.5 bg-dark-bg border border-dark-border px-3.5 py-1.5 rounded-full shadow-sm text-gray-300">
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">
                        CURRENT:
                      </span>
                      <Flame size={12} className="text-orange-500" />
                      <span className="text-[11px] font-black font-mono">
                        {curStreak}d
                      </span>
                    </div>

                    {/* Best Streak pill badge */}
                    <div className="flex items-center gap-1.5 bg-brand-500/10 border border-brand-500/20 px-3.5 py-1.5 rounded-full text-brand-400 shadow-sm">
                      <span className="text-[8px] font-black text-brand-500 uppercase tracking-widest">
                        BEST:
                      </span>
                      <Trophy size={11} />
                      <span className="text-[11px] font-black font-mono">
                        {bestStreak}d
                      </span>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Decorative Premium Footer quote */}
      <div className="py-8 text-center border-t border-dark-border/40 mt-12 select-none">
        <p className="text-[11px] text-gray-500 font-extrabold tracking-widest uppercase italic">
          "Consistency is the compound interest of self-improvement."
        </p>
      </div>

    </div>
  );
}
