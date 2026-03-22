import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore.js'

const ROTATION_NAMES = ['Full Body', 'Upper', 'Lower']

export default function Settings() {
  const navigate = useNavigate()
  const currentWeek = useStore((s) => s.currentWeek)
  const workoutRotation = useStore((s) => s.workoutRotation)
  const history = useStore((s) => s.history)
  const setCurrentWeek = useStore((s) => s.setCurrentWeek)
  const clearHistory = useStore((s) => s.clearHistory)

  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const store = useStore.getState()

  const handleResetRotation = () => {
    useStore.setState({ workoutRotation: 0 })
  }

  const handleClearHistory = () => {
    clearHistory()
    setShowClearConfirm(false)
  }

  return (
    <div className="page">
      {/* Nav */}
      <div className="nav-bar">
        <button className="nav-back" onClick={() => navigate('/')}>
          <span className="nav-back-icon">‹</span>
          Home
        </button>
        <div className="nav-title">Settings</div>
        <div className="nav-spacer" />
      </div>

      <div className="page-content">

        {/* Program Settings */}
        <div className="section-title" style={{ marginTop: 8 }}>Program</div>
        <div className="settings-section">
          <div className="settings-row" style={{ borderRadius: 'var(--radius) var(--radius) 0 0' }}>
            <span className="settings-row-label">Current Week</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="week-btn"
                onClick={() => setCurrentWeek(currentWeek - 1)}
                disabled={currentWeek <= 1}
              >
                −
              </button>
              <span style={{ fontSize: 16, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>
                {currentWeek}
              </span>
              <button
                className="week-btn"
                onClick={() => setCurrentWeek(currentWeek + 1)}
                disabled={currentWeek >= 12}
              >
                +
              </button>
            </div>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Next Workout</span>
            <span className="settings-row-value">{ROTATION_NAMES[workoutRotation]}</span>
          </div>

          <div
            className="settings-row"
            style={{
              borderRadius: '0 0 var(--radius) var(--radius)',
              cursor: 'pointer',
            }}
            onClick={handleResetRotation}
          >
            <span className="settings-row-label" style={{ color: 'var(--blue)' }}>
              Reset to Full Body
            </span>
          </div>
        </div>

        {/* Data */}
        <div className="section-title">Data</div>
        <div className="settings-section">
          <div className="settings-row" style={{ borderRadius: 'var(--radius) var(--radius) 0 0' }}>
            <span className="settings-row-label">Workouts Logged</span>
            <span className="settings-row-value">{history.length}</span>
          </div>

          <div
            className="settings-row"
            style={{
              borderRadius: '0 0 var(--radius) var(--radius)',
              cursor: 'pointer',
            }}
            onClick={() => setShowClearConfirm(true)}
          >
            <span className="settings-row-label" style={{ color: 'var(--red)' }}>
              Clear All History
            </span>
          </div>
        </div>

        {showClearConfirm && (
          <div className="card" style={{ border: '1px solid var(--red)', marginTop: 8 }}>
            <div style={{ fontSize: 15, marginBottom: 16, color: 'var(--text2)' }}>
              Are you sure? This will permanently delete all {history.length} workout{history.length !== 1 ? 's' : ''} from history.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm btn-danger" style={{ flex: 1 }} onClick={handleClearHistory}>
                Delete All
              </button>
              <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => setShowClearConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* About */}
        <div className="section-title">About</div>
        <div className="settings-section">
          <div className="settings-row" style={{ borderRadius: 'var(--radius) var(--radius) 0 0' }}>
            <span className="settings-row-label">App</span>
            <span className="settings-row-value">Essentials Tracker</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Program</span>
            <span className="settings-row-value">Jeff Nippard Essentials</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Blocks</span>
            <span className="settings-row-value">3 × 4 weeks</span>
          </div>
          <div
            className="settings-row"
            style={{ borderRadius: '0 0 var(--radius) var(--radius)' }}
          >
            <span className="settings-row-label">Version</span>
            <span className="settings-row-value">1.0.0</span>
          </div>
        </div>

        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}
