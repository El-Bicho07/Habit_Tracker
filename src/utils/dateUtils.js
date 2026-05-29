/**
 * Generates an array of 7 Date objects representing the Monday to Sunday week
 * containing the referenceDate.
 * 
 * @param {Date} referenceDate 
 * @returns {Date[]}
 */
export function getWeekDates(referenceDate) {
  const date = new Date(referenceDate);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  // Find difference to Monday
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(date.setDate(diff));
  
  const week = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    week.push(nextDay);
  }
  return week;
}

/**
 * Timezone-safe date formatting helper to get YYYY-MM-DD
 * 
 * @param {Date} date 
 * @returns {string} YYYY-MM-DD
 */
export function formatDateKey(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Calculates current streak length based on active grace-period logic:
 * - If completed today, streak includes today + consecutive prior days
 * - If not completed today, but completed yesterday, streak is counted from yesterday (grace period)
 * - If not completed yesterday or today, streak is 0.
 * 
 * @param {string[]} completionDates Array of YYYY-MM-DD completion strings
 * @param {string} todayDateStr YYYY-MM-DD of today
 * @returns {number} The current streak length
 */
export function getStreak(completionDates, todayDateStr) {
  if (!completionDates || completionDates.length === 0) return 0;
  
  const completionsSet = new Set(completionDates);
  const today = new Date(todayDateStr + 'T00:00:00');
  
  const completedToday = completionsSet.has(todayDateStr);
  
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayDateStr = formatDateKey(yesterday);
  const completedYesterday = completionsSet.has(yesterdayDateStr);
  
  let currentDate = null;
  if (completedToday) {
    currentDate = today;
  } else if (completedYesterday) {
    currentDate = yesterday;
  } else {
    return 0; // Streak reset since yesterday wasn't completed
  }
  
  let streak = 0;
  while (true) {
    const dateStr = formatDateKey(currentDate);
    if (completionsSet.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Get human readable date string like "Tuesday, 26 May 2026"
 * 
 * @param {Date} date 
 * @returns {string}
 */
export function formatReadableDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
