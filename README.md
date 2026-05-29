# HabitFlow

A desktop-first habit tracker web app built with React, Vite, and Tailwind CSS. Track daily habits, monitor streaks, and review your progress — all stored locally in your browser with no account required.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)

---

## Features

- **Daily habit tracking** — Check off habits for each day of the week in a clean weekly grid view
- **Streak calculation** — Automatically calculates and displays your current streak per habit with an active grace period model
- **Week navigation** — Browse previous and future weeks to log or review completions
- **Progress analytics** — Dedicated progress page with lifetime stats, weekly completion trends bar chart, and per-habit breakdown
- **Summary stats** — Today's completion rate, best active streak, and weekly completion percentage update in real time
- **Add, rename, delete habits** — Full habit management from the Settings page with deletion confirmation
- **Data export** — Backup all habits and completions as a JSON file at any time
- **Dark / Light mode** — Toggle between themes, preference saved automatically
- **No account required** — All data stored locally in browser localStorage, no backend, no signup

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 6 |
| Styling | Tailwind CSS v4 |
| Data persistence | Browser localStorage |
| Hosting | Vercel |

---

## Project Structure

```
src/
├── main.jsx                  # React entry point
├── index.css                 # Tailwind v4 theme and global styles
├── App.jsx                   # Root layout, state management, view routing
├── utils/
│   └── dateUtils.js          # Week calculations, date formatting, streak logic
└── components/
    ├── HabitGrid.jsx          # Weekly habit grid with checkboxes
    ├── StatsSummary.jsx       # Three KPI stat cards
    ├── AddHabitModal.jsx      # Add habit modal with validation
    ├── ProgressView.jsx       # Analytics page with bar chart and habit breakdown
    └── SettingsView.jsx       # Habit management and data tools
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/El-Bicho07/Habit_Tracker.git
cd Habit_Tracker

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for production

```bash
npm run build
```

---

## Data Model

All data is stored in browser localStorage under two keys:

```json
habitflow_habits       → Array of habit objects { id, name, createdAt }
habitflow_completions  → Object mapping habitId to array of YYYY-MM-DD date strings
habitflow_theme        → "dark" or "light"
```

Habits only appear in weeks on or after their `createdAt` date. Completion slots are only counted from a habit's creation date onward, ensuring accurate percentage calculations.

---

## Streak Logic

The app uses an **active grace period** model:

- If a habit is completed **today** → streak includes today plus consecutive prior days
- If a habit is **not completed today** but was completed **yesterday** → streak remains active since today is still in progress
- If neither today nor yesterday is completed → streak resets to 0

---

## Screenshots

![Dashboard](https://github.com/user-attachments/assets/d4f13aa7-1606-427d-a623-f049669ee0ec)

![Progress](https://github.com/user-attachments/assets/6e69c544-86b8-4092-9727-f403783150e2)

![Settings](https://github.com/user-attachments/assets/776a9ea4-b243-4c7f-bf1b-fa3f22e43180)

## License

This project is open source and available under the [MIT License](LICENSE).
