import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore.js'
import { getWorkoutForWeek, EXERCISES } from '../data/workouts.js'

export default function WorkoutOverview() {
  const navigate = useNavigate()
  const currentWeek = useStore((s) => s.currentWeek)
  const workoutRotation = useStore((s) => s.workoutRotation)
  const session = useStore((s) => s.session)
  const startWorkout = useStore((s) => s.startWorkout)

  const workout = getWorkoutForWeek(currentWeek, workoutRotation)
  const [expandedIds, setExpandedIds] = useState(new Set())

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBegin = () => {
    if (!session) {
      startWorkout(workout.id)
    }
    navigate('/workout')
  }

  const exercises = (workout?.exercises || []).map((id) => EXERCISES[id]).filter(Boolean)

  // Group by superset
  const rendered = new Set()

  const getMuscleColor = (muscle) => {
    const colors = {
      Quads: 'var(--blue)',
      Hamstrings: 'var(--green)',
      Chest: 'var(--accent)',
      Back: '#bf5af2',
      Shoulders: '#64d2ff',
      Biceps: '#ff375f',
      Triceps: '#ff6961',
      Calves: 'var(--green)',
      Abs: '#ffd60a',
    }
    return colors[muscle] || 'var(--text2)'
  }

  return (
    <div className="page">
      {/* Nav */}
      <div className="nav-bar">
        <button className="nav-back" onClick={() => navigate('/')}>
          <span className="nav-back-icon">‹</span>
          <span>Home</span>
        </button>
        <div className="nav-title">
          {workout?.name} — Block {workout?.block}
        </div>
        <div className="nav-spacer" />
      </div>

      <div className="page-content">
        <div className="section-title" style={{ marginTop: 8 }}>
          Weeks {workout?.weeks} • {exercises.length} Exercises
        </div>

        {exercises.map((ex) => {
          if (rendered.has(ex.id)) return null
          rendered.add(ex.id)

          const isExpanded = expandedIds.has(ex.id)

          // Find superset partner
          let partnerEx = null
          if (ex.supersetGroup) {
            const partnerId = workout.exercises.find((id) => {
              const e = EXERCISES[id]
              return (
                e &&
                e.id !== ex.id &&
                e.supersetGroup === ex.supersetGroup
              )
            })
            if (partnerId) {
              partnerEx = EXERCISES[partnerId]
              rendered.add(partnerId)
            }
          }

          const setsLabel = ex.workingSets === 1
            ? '1 set'
            : `${ex.workingSets} sets`

          return (
            <div key={ex.id}>
              {ex.supersetGroup && partnerEx && (
                <div className="superset-banner" style={{ marginBottom: 4 }}>
                  SUPERSET — {ex.supersetGroup}
                </div>
              )}

              <div className="overview-exercise-row">
                <div
                  className="overview-exercise-main"
                  onClick={() => toggleExpand(ex.id)}
                >
                  <div className="overview-exercise-info">
                    <div className="overview-exercise-name">
                      {ex.name}
                      {ex.variant && (
                        <span style={{ color: 'var(--accent)', fontSize: 13, marginLeft: 6 }}>
                          ({ex.variant})
                        </span>
                      )}
                    </div>
                    <div className="overview-exercise-detail">
                      {setsLabel} × {ex.reps} reps • RPE {ex.rpe}
                    </div>
                  </div>
                  <div className="overview-exercise-right">
                    <span
                      className="chip"
                      style={{ color: getMuscleColor(ex.muscle), background: 'var(--surface2)' }}
                    >
                      {ex.muscle}
                    </span>
                    <span
                      className={`overview-expand-icon ${isExpanded ? 'expanded' : ''}`}
                    >
                      ›
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="overview-notes">
                    {ex.isDropset && (
                      <div style={{ color: 'var(--red)', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>
                        DROPSET — reduce weight ~50% after main set
                      </div>
                    )}
                    {ex.warmupSets !== '0' && (
                      <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 8 }}>
                        Warmup sets: {ex.warmupSets}
                      </div>
                    )}
                    {ex.notes}
                    {ex.subs.length > 0 && (
                      <div style={{ marginTop: 10, color: 'var(--text3)', fontSize: 13 }}>
                        Subs: {ex.subs.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Superset partner */}
              {partnerEx && (() => {
                const partnerExpanded = expandedIds.has(partnerEx.id)
                const partnerSetsLabel = partnerEx.workingSets === 1
                  ? '1 set'
                  : `${partnerEx.workingSets} sets`
                return (
                  <div className="overview-exercise-row" style={{ marginBottom: 12 }}>
                    <div
                      className="overview-exercise-main"
                      onClick={() => toggleExpand(partnerEx.id)}
                    >
                      <div className="overview-exercise-info">
                        <div className="overview-exercise-name">
                          {partnerEx.name}
                          {partnerEx.variant && (
                            <span style={{ color: 'var(--accent)', fontSize: 13, marginLeft: 6 }}>
                              ({partnerEx.variant})
                            </span>
                          )}
                        </div>
                        <div className="overview-exercise-detail">
                          {partnerSetsLabel} × {partnerEx.reps} reps • RPE {partnerEx.rpe}
                        </div>
                      </div>
                      <div className="overview-exercise-right">
                        <span
                          className="chip"
                          style={{ color: getMuscleColor(partnerEx.muscle), background: 'var(--surface2)' }}
                        >
                          {partnerEx.muscle}
                        </span>
                        <span className={`overview-expand-icon ${partnerExpanded ? 'expanded' : ''}`}>
                          ›
                        </span>
                      </div>
                    </div>
                    {partnerExpanded && (
                      <div className="overview-notes">
                        {partnerEx.notes}
                        {partnerEx.subs.length > 0 && (
                          <div style={{ marginTop: 10, color: 'var(--text3)', fontSize: 13 }}>
                            Subs: {partnerEx.subs.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )
        })}

        <div style={{ height: 24 }} />

        <button className="btn btn-primary btn-full" onClick={handleBegin}>
          {session ? 'Resume Workout' : 'Begin Workout'}
        </button>
        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}
