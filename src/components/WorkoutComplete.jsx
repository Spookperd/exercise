import React from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore.js'
import { EXERCISES, WORKOUTS } from '../data/workouts.js'

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m ${seconds}s`
}

export default function WorkoutComplete({ session }) {
  const navigate = useNavigate()
  const finishWorkout = useStore((s) => s.finishWorkout)

  const workout = WORKOUTS.find((w) => w.id === session.workoutId)
  const duration = (session.completedAt || Date.now()) - session.startedAt

  const totalSets = Object.values(session.logs).reduce(
    (acc, sets) => acc + sets.length,
    0
  )

  const loggedExerciseIds = Object.keys(session.logs).filter(
    (id) => session.logs[id]?.length > 0
  )

  const handleFinish = () => {
    finishWorkout()
    navigate('/')
  }

  return (
    <div className="workout-complete">
      <div className="complete-icon">🏆</div>
      <div className="complete-title">Workout Complete!</div>
      <div className="complete-duration">{formatDuration(duration)}</div>

      <div className="card complete-stats" style={{ width: '100%' }}>
        <div className="stat-row">
          <span className="stat-label">Workout</span>
          <span className="stat-value">
            {workout?.name} — Block {workout?.block}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Total Sets</span>
          <span className="stat-value">{totalSets}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Exercises</span>
          <span className="stat-value">{loggedExerciseIds.length}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Duration</span>
          <span className="stat-value">{formatDuration(duration)}</span>
        </div>
      </div>

      {loggedExerciseIds.length > 0 && (
        <div className="card" style={{ width: '100%', marginBottom: 24 }}>
          <div className="card-title" style={{ marginBottom: 12 }}>Sets Logged</div>
          {loggedExerciseIds.map((exId) => {
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
                      {s.isDropset ? ' ↓' : ''}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button className="btn btn-primary btn-full" onClick={handleFinish}>
        Finish & Save
      </button>
    </div>
  )
}
