# Fitness Tracker — Frontend

A premium, dark-themed fitness tracking application built with **React + Vite**. Users can track workouts, nutrition, progress, analytics, goals, reminders, and more — all with a charcoal + red "VIP" aesthetic, smooth scrolling, and rich animations.

## Tech Stack

- **React 19 + Vite 8** — fast build tooling with HMR
- **React Router v7** — client-side routing
- **Tailwind CSS v4** — utility-first styling
- **GSAP + ScrollTrigger** — premium scroll & menu-click animations
- **Lenis** — buttery smooth scrolling
- **Chart.js + react-chartjs-2** — data visualization (line, bar, doughnut, pie)
- **Axios** — API communication
- **react-hot-toast** — notifications

## Getting Started

### Prerequisites

- Node.js 18+
- The backend running locally at `http://localhost:5000` (see `backend/` repo)

### Install & Run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Environment

Create a `.env.local` file (gitignored) with:

```env
VITE_API_URL=http://localhost:5000/api
```

> When no env variable is set, the app falls back to the live production backend: `https://fitness-tracker-backend-ten.vercel.app/api`.

### Production Build

```bash
npm run build
npm run preview
```

## Features

- **Auth** — register, login, logout with JWT. Registration redirects to the login screen where the user signs in with their new credentials.
- **Dashboard** — overview of workouts, calories, weight, goals, weekly activity, and nutrition with charts.
- **Workouts** — create, edit, and track workout sessions.
- **Nutrition** — log meals, track protein/carbs/fats, daily macros summary.
- **Progress** — record weight, body measurements, running, and lifting stats.
- **Analytics / Data Visualization** — charts for workout frequency, calories, macros, exercise history, and more.
- **Goals, Reports, Reminders, Notifications, Search, Profile, Settings, Support** — full fitness ecosystem.

## VIP Premium Theme

- Deep **charcoal** background with subtle **red** ambient glows.
- Reusable premium components styled in `src/index.css`:
  - `.vip-card` — charcoal cards with red top-sheen and hover glow
  - `.vip-banner` — gradient hero header strips
  - `.vip-chip` / `.vip-chip-active` — pill filter buttons
  - `.vip-btn-primary` — gradient red action buttons
  - `.vip-card-title` / `.vip-accent` — consistent card headings
- Cards are fully responsive (`min-width: 0`) so charts never overflow their containers.

## Animations

- **Smooth scrolling** via Lenis, synced with GSAP ScrollTrigger (`src/components/SmoothScroll.jsx`).
- **Scroll-reveal** animations with `Reveal.jsx` (fade + slide + blur).
- **Route transitions** with `PageTransition.jsx` — each menu click animates the page in.
- **Auth loading screen** — after login, a full-screen overlay shows the pulsing logo with an animated red loading line before entering the dashboard.

## Project Structure

```
src/
├── components/     # Sidebar, Reveal, SmoothScroll, PageTransition, ProtectedRoute, Icon
├── context/        # AuthContext, ThemeContext
├── pages/          # Dashboard, Nutrition, Progress, Analytics, Workouts, etc.
├── services/       # Axios API helpers
└── assets/images/  # Static assets (logo)
```

## Deployment

Deployed to **Vercel**. Pushing to `main` automatically redeploys the live site.

```bash
git add .
git commit -m "your message"
git push origin main
```
