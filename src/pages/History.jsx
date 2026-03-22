import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore.js'
import { EXERCISES, WORKOUTS } from '../data/workouts.js'

function formatDate(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function formatDuration(ms) {
  if (!ms || ms < 0) return '—'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m ${seconds}s`
}

export default function History() {
  const navigate = useNavigate()
  const history = useStore((s) => s.history)
  const deleteSession = useStore((s) => s.deleteSession)
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="page">
      {/* Nav */}
      <div className="nav-bar">
        <button className="nav-back" onClick={() => navigate('/')}>
          <span className="nav-back-icon">‹</span>
          Home
        </button>
        <div className="nav-title">History</div>
        <div className="nav-spacer" />
      </div>

      <div className="page-content">
        {history.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 48 }}>
            <div className="empty-icon">📋</div>
            <div className="empty-title">No workouts yet</div>
            <div className="empty-body">
              Complete a workout to see your history here.
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>
              {history.length} workout{history.length !== 1 ? 's' : ''} completed
            </div>

            {history.map((session) => {
              const workout = WORKOUTS.find((w) => w.id === session.workoutId)
              const isExpanded = expandedIds.has(session.id)
              const duration = session.completedAt
                ? session.completedAt - session.startedAt
                : null

              const loggedExerciseIds = Object.keys(session.logs || {}).filter(
                (id) => (session.logs[id]?.length || 0) > 0
              )

              const totalSets = loggedExerciseIds.reduce(
                (acc, id) => acc + (session.logs[id]?.length || 0),
                0
              )

              return (
                <div key={session.id} className="history-session">
                  <div
                    className="history-session-header"
                    onClick={() => toggleExpand(session.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <div className="history-session-title">
                        {workout?.name || 'Workout'} — Block {workout?.block || '?'}
                      </div>
                      <div className="history-session-meta">
                        {formatDate(session.startedAt)} at {formatTime(session.startedAt)}
                        {duration ? ` • ${formatDuration(duration)}` : ''}
                        {` • ${totalSets} sets`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {confirmDeleteId === session.id ? (
                        <>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={(e) => { e.stopPropagation(); deleteSession(session.id) }}
                          >
                            Delete
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null) }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn-icon"
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(session.id) }}
                          title="Delete workout"
                        >
                          🗑
                        </button>
                      )}
                      <span style={{ color: 'var(--text3)', fontSize: 18 }}>
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="history-session-body">
                      {loggedExerciseIds.length === 0 ? (
                        <div style={{ color: 'var(--text3)', fontSize: 14, paddingTop: 8 }}>
                          No sets logged
                        </div>
                      ) : (
                        loggedExerciseIds.map((exId) => {
                          const ex = EXERCISES[exId]
                          const sets = session.logs[exId] || []
                          const subIndex = session.substitutions?.[exId]
                          const displayName =
                            subIndex !== undefined && ex?.subs?.[subIndex]
                              ? ex.subs[subIndex]
                              : ex?.name || exId

                          return (
                            <div key={exId} className="history-exercise">
                              <div className="history-exercise-name">{displayName}</div>
                              <div className="history-sets">
                                {sets.map((s, i) => (
                                  <div key={i} className="history-set-chip">
                                    {s.weight > 0 ? `${s.weight}kg` : 'BW'} × {s.reps}
                                    {s.rpe ? ` @${s.rpe}` : ''}
                                    {s.isDropset ? ' ↓' : ''}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}
