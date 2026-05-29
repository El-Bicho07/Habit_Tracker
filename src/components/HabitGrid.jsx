import React from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { formatDateKey, getStreak } from '../utils/dateUtils';

export default function HabitGrid({ 
  habits, 
  completions, 
  onToggle, 
  weekDates, 
  onPrevWeek, 
  onNextWeek, 
  onJumpToToday,
  referenceDate 
}) {
  const todayStr = formatDateKey(new Date());

  // Format week range label (e.g., "May 25 – May 31, 2026")
  const startOfWeek = weekDates[0];
  const endOfWeek = weekDates[6];
  
  const getMonthName = (date) => date.toLocaleString('en-US', { month: 'short' });
  const getYear = (date) => date.getFullYear();

  let weekRangeLabel = '';
  if (startOfWeek && endOfWeek) {
    const startMonth = getMonthName(startOfWeek);
    const endMonth = getMonthName(endOfWeek);
    
    if (startOfWeek.getFullYear() !== endOfWeek.getFullYear()) {
      weekRangeLabel = `${startMonth} ${startOfWeek.getDate()}, ${getYear(startOfWeek)} – ${endMonth} ${endOfWeek.getDate()}, ${getYear(endOfWeek)}`;
    } else if (startMonth !== endMonth) {
      weekRangeLabel = `${startMonth} ${startOfWeek.getDate()} – ${endMonth} ${endOfWeek.getDate()}, ${getYear(startOfWeek)}`;
    } else {
      weekRangeLabel = `${startMonth} ${startOfWeek.getDate()} – ${endOfWeek.getDate()}, ${getYear(startOfWeek)}`;
    }
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden shadow-level-1">
      {/* Grid Controller Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-b border-dark-border bg-dark-sidebar/40">
        <h3 className="text-base font-bold text-gray-200 font-display">Weekly Tracker</h3>
        
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-dark-bg border border-dark-border rounded-xl p-1">
            <button 
              onClick={onPrevWeek}
              className="text-gray-400 hover:text-gray-200 hover:bg-dark-hover p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] font-black px-2 text-gray-300 select-none min-w-[130px] text-center font-display tracking-wide">
              {weekRangeLabel}
            </span>
            <button 
              onClick={onNextWeek}
              className="text-gray-400 hover:text-gray-200 hover:bg-dark-hover p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          
          <button
            onClick={onJumpToToday}
            className="px-3.5 py-2 bg-dark-hover hover:bg-dark-border border border-dark-border text-xs font-black text-brand-500 hover:text-brand-400 rounded-xl transition-colors cursor-pointer tracking-wider uppercase font-display"
          >
            Today
          </button>
        </div>
      </div>

      {/* Grid Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse text-left">
          <thead>
            <tr className="border-b border-dark-border bg-dark-sidebar/10">
              <th className="p-4 pl-6 text-xs font-extrabold tracking-widest text-gray-500 uppercase w-[35%] select-none font-display">
                Habit
              </th>
              {weekDates.map((date) => {
                const dateStr = formatDateKey(date);
                const isToday = dateStr === todayStr;
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                
                return (
                  <th 
                    key={dateStr}
                    className={`p-4 text-center text-xs font-bold uppercase tracking-wider select-none relative ${
                      isToday ? 'text-brand-500' : 'text-gray-500'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="flex items-center gap-1 font-display tracking-wider">
                        {dayName}
                        {isToday && <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse inline-block" />}
                      </span>
                      <span className={`text-[10px] mt-1 font-mono font-black ${isToday ? 'text-brand-300' : 'text-gray-600'}`}>
                        {date.getDate()}
                      </span>
                    </div>
                    {isToday && (
                      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-brand-500" />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {habits.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <p className="text-sm font-semibold text-gray-400">No habits yet. Add your first habit to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              habits.map((habit) => {
                const completionList = completions[habit.id] || [];
                const currentStreak = getStreak(completionList, todayStr);
                const categoryLabel = (habit.category || 'GROWTH').toUpperCase();
                
                return (
                  <tr 
                    key={habit.id}
                    className="border-b border-dark-border last:border-0 hover:bg-dark-sidebar/10 transition-colors"
                  >
                    {/* Habit Name / Streak Badge */}
                    <td className="p-4 pl-6 align-middle">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-200 text-[13px] font-display truncate max-w-[160px]" title={habit.name}>
                            {habit.name}
                          </span>
                          
                          {/* Streak Capsule */}
                          {currentStreak > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9px] font-black text-orange-400 select-none animate-fade-in font-mono">
                              🔥{currentStreak}d
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-gray-500 font-extrabold tracking-widest uppercase font-display">
                          {categoryLabel}
                        </span>
                      </div>
                    </td>

                    {/* 7 Checkboxes */}
                    {weekDates.map((date) => {
                      const dateStr = formatDateKey(date);
                      const isToday = dateStr === todayStr;
                      const isCompleted = completionList.includes(dateStr);
                      
                      return (
                        <td 
                          key={dateStr}
                          className={`p-4 text-center align-middle relative ${
                            isToday ? 'bg-brand-500/[0.01]' : ''
                          }`}
                        >
                          <div className="flex justify-center">
                            <button
                              onClick={() => onToggle(habit.id, dateStr)}
                              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                                isCompleted 
                                  ? 'bg-brand-500 border-brand-500 text-dark-bg animate-check-pop shadow-sm shadow-brand-500/20' 
                                  : 'border-dark-border/60 bg-transparent text-gray-600 hover:border-gray-500 hover:text-gray-400'
                              }`}
                              aria-label={`Toggle completion for ${habit.name} on ${dateStr}`}
                            >
                              {isCompleted ? (
                                <Check size={13} strokeWidth={3.5} />
                              ) : (
                                <span className="text-xs font-black select-none">+</span>
                              )}
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
