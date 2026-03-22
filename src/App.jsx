import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import WorkoutOverview from './pages/WorkoutOverview.jsx'
import ActiveWorkout from './pages/ActiveWorkout.jsx'
import History from './pages/History.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/overview" element={<WorkoutOverview />} />
        <Route path="/workout" element={<ActiveWorkout />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </HashRouter>
  )
}
