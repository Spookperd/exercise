import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore.js'
import { getWorkoutForWeek, EXERCISES } from '../data/workouts.js'

const BLOCK_WEEKS = {
  1: 'Weeks 1-4',
  2: 'Weeks 5-8',
  3: 'Weeks 9-12',
}

const ROTATION_NAMES = ['Full Body', 'Upper', 'Lower']

function getBlockForWeek(week) {
  if (week <= 4) return 1
  if (week <= 8) return 2
  return 3
}

export default function Home() {
  const navigate = useNavigate()
  const currentWeek = useStore((s) => s.currentWeek)
  const workoutRotation = useStore((s) => s.workoutRotation)
  const session = useStore((s) => s.session)
  const setCurrentWeek = useStore((s) => s.setCurrentWeek)

  // Auto-resume if a workout is already in progress
  useEffect(() => {
    if (session) navigate('/workout')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const workout = getWorkoutForWeek(currentWeek, workoutRotation)
  const block = getBlockForWeek(currentWeek)

  // Preview exercises (first 5)
  const previewExercises = (workout?.exercises || []).slice(0, 5).map((id) => EXERCISES[id])

  return (
    <div className="page" style={{ overflow: 'auto' }}>
      {/* Header */}
      <div className="home-header">
        <div style={{ paddingTop: 'env(safe-area-inset-top)' }} />
        <div className="home-title">
          Essentials<span>.</span>
        </div>
        <div style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          Jeff Nippard's Essentials Program
        </div>
      </div>

      <div className="page-content">
        {/* Week Selector */}
        <div className="section-title">Current Week</div>
        <div className="card" style={{ marginBottom: 8 }}>
          <div className="week-row">
            <div>
              <div className="week-display">Week {currentWeek}</div>
              <div className="block-info">
                Block {block} • {BLOCK_WEEKS[block]}
              </div>
            </div>
            <div className="week-stepper">
              <button
                className="week-btn"
                onClick={() => setCurrentWeek(currentWeek - 1)}
                disabled={currentWeek <= 1}
              >
                −
              </button>
              <span className="week-num">{currentWeek}</span>
              <button
                className="week-btn"
                onClick={() => setCurrentWeek(currentWeek + 1)}
                disabled={currentWeek >= 12}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Resume banner if session active */}
        {session && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(48,209,88,0.12) 0%, rgba(48,209,88,0.05) 100%)',
              border: '1px solid rgba(48,209,88,0.3)',
              borderRadius: 'var(--radius)',
              padding: '16px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 15 }}>
                Workout in Progress
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
                {ROTATION_NAMES[workoutRotation]} — Block {block}
              </div>
            </div>
            <button
              className="btn btn-sm"
              style={{ background: 'var(--green)', color: '#000', fontWeight: 700 }}
              onClick={() => navigate('/workout')}
            >
              Resume
            </button>
          </div>
        )}

        {/* Next Workout Card */}
        <div className="section-title">
          {session ? 'After This Workout' : 'Next Workout'}
        </div>

        <div className="next-workout-card">
          <div className="workout-type-tag">
            {ROTATION_NAMES[workoutRotation]}
          </div>
          <div className="next-workout-name">{workout?.name || 'Workout'}</div>
          <div className="next-workout-block">
            Block {block} • {BLOCK_WEEKS[block]}
          </div>

          <div className="exercise-preview-list">
            {previewExercises.map((ex) => ex && (
              <div key={ex.id} className="exercise-preview-item">
                {ex.name}
                {ex.variant ? ` (${ex.variant})` : ''}
              </div>
            ))}
            {(workout?.exercises?.length || 0) > 5 && (
              <div className="exercise-preview-item" style={{ color: 'var(--text3)' }}>
                +{(workout?.exercises?.length || 0) - 5} more
              </div>
            )}
          </div>

          {!session ? (
            <button
              className="btn btn-primary btn-full"
              onClick={() => navigate('/overview')}
            >
              Start Workout
            </button>
          ) : (
            <button
              className="btn btn-ghost btn-full"
              onClick={() => navigate('/overview')}
            >
              Preview Workout
            </button>
          )}
        </div>

        {/* Bottom Nav */}
        <div className="home-bottom-nav">
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={() => navigate('/history')}
          >
            History
          </button>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={() => navigate('/settings')}
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}
