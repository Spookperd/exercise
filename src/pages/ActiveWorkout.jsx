import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore.js'
import { EXERCISES, WORKOUTS } from '../data/workouts.js'
import RestTimer from '../components/RestTimer.jsx'
import NotesPanel from '../components/NotesPanel.jsx'
import WorkoutComplete from '../components/WorkoutComplete.jsx'

function getSuggestedDropWeight(weight) {
  if (!weight || weight <= 0) return ''
  const half = weight * 0.5
  return Math.round(half / 2.5) * 2.5
}

export default function ActiveWorkout() {
  const navigate = useNavigate()
  const session = useStore((s) => s.session)
  const logSet = useStore((s) => s.logSet)
  const skipExercise = useStore((s) => s.skipExercise)
  const returnParked = useStore((s) => s.returnParked)
  const skipRestTimer = useStore((s) => s.skipRestTimer)
  const exerciseDefaults = useStore((s) => s.exerciseDefaults)

  // Local state
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [rpe, setRpe] = useState('')
  const [warmupAcknowledged, setWarmupAcknowledged] = useState({}) // { exerciseId: true }
  const [showNotes, setShowNotes] = useState(false)
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)

  // Redirect if no session
  useEffect(() => {
    if (!session) {
      navigate('/')
    }
  }, [session, navigate])

  if (!session) return null

  const { queue, queueIndex, parkedExercises, substitutions, logs, dropsetPhase, restingUntil, completedAt } = session

  // ─── Workout Complete ────────────────────────────────────────
  if (queueIndex >= queue.length && parkedExercises.length === 0) {
    return (
      <div className="page" style={{ overflowY: 'auto' }}>
        <div className="nav-bar">
          <div className="nav-spacer" />
          <div className="nav-title">Workout</div>
          <div className="nav-spacer" />
        </div>
        <div className="page-content">
          <WorkoutComplete session={session} />
        </div>
      </div>
    )
  }

  const currentItem = queue[queueIndex]
  if (!currentItem) {
    // Queue exhausted but parked exercises remain — show option to return them
    return (
      <div className="page">
        <div className="nav-bar">
          <button className="nav-back" onClick={() => navigate('/')}>
            <span className="nav-back-icon">‹</span>
            Home
          </button>
          <div className="nav-title">Workout</div>
          <div className="nav-spacer" />
        </div>
        <div className="page-content">
          <div className="empty-state">
            <div className="empty-icon">⏸</div>
            <div className="empty-title">Main sets done</div>
            <div className="empty-body">You have {parkedExercises.length} skipped exercise(s) remaining.</div>
          </div>
          <div className="section-title">Skipped Exercises</div>
          {parkedExercises.map((exId) => {
            const ex = EXERCISES[exId]
            if (!ex) return null
            return (
              <div key={exId} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{ex.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>{ex.workingSets} sets × {ex.reps}</div>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => returnParked(exId)}>
                  Do Now
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const exerciseId = currentItem.exerciseId
  const ex = EXERCISES[exerciseId]
  if (!ex) return null

  // Get display name (consider substitution)
  const subIndex = substitutions[exerciseId]
  const displayName = subIndex !== undefined && ex.subs[subIndex] ? ex.subs[subIndex] : ex.name

  // ─── Pre-fill weight on exercise change ──────────────────────
  const lastWeight = exerciseDefaults[exerciseId]?.weight
  const initialWeight = dropsetPhase
    ? getSuggestedDropWeight(lastWeight || parseFloat(weight) || 0)
    : (lastWeight ? String(lastWeight) : '')

  // Use effect to prefill when exercise/set changes
  // (we do this imperatively below via key trick)

  // ─── Warmup check ────────────────────────────────────────────
  const needsWarmup =
    !dropsetPhase &&
    ex.warmupSets !== '0' &&
    currentItem.setNumber === 1 &&
    !warmupAcknowledged[exerciseId]

  // ─── Rest Timer ──────────────────────────────────────────────
  const isResting = restingUntil && restingUntil > Date.now()

  // Get next exercise for rest timer
  const nextItem = queue[queueIndex]
  const nextEx = nextItem ? EXERCISES[nextItem.exerciseId] : null

  // ─── Progress dots ───────────────────────────────────────────
  // Get unique exercise IDs in order
  const allExerciseIds = []
  const seen = new Set()
  for (const item of queue) {
    if (!seen.has(item.exerciseId)) {
      seen.add(item.exerciseId)
      allExerciseIds.push(item.exerciseId)
    }
  }
  // Add parked
  for (const id of parkedExercises) {
    if (!seen.has(id)) {
      seen.add(id)
      allExerciseIds.push(id)
    }
  }

  const completedExIds = new Set(
    queue.slice(0, queueIndex).map((item) => item.exerciseId)
  )

  // ─── Handlers ────────────────────────────────────────────────
  const handleAcknowledgeWarmup = () => {
    setWarmupAcknowledged((prev) => ({ ...prev, [exerciseId]: true }))
  }

  const handleLogSet = () => {
    if (!weight && !rpe) return
    const w = parseFloat(weight) || 0
    const r = parseInt(reps) || 0
    const rpeVal = parseFloat(rpe) || null
    logSet(w, r, rpeVal)
    // Clear inputs for next set
    setWeight('')
    setReps('')
    setRpe('')
  }

  const handleSkip = () => {
    setShowSkipConfirm(false)
    skipExercise()
    setWeight('')
    setReps('')
    setRpe('')
    setWarmupAcknowledged((prev) => ({ ...prev, [exerciseId]: false }))
  }

  const adjustWeight = (delta) => {
    const current = parseFloat(weight) || 0
    const next = Math.max(0, Math.round((current + delta) * 10) / 10)
    setWeight(String(next))
  }

  const adjustReps = (delta) => {
    const current = parseInt(reps) || 0
    const next = Math.max(0, current + delta)
    setReps(String(next))
  }

  const adjustRpe = (delta) => {
    const current = parseFloat(rpe) || 5
    const next = Math.max(1, Math.min(10, Math.round((current + delta) * 2) / 2))
    setRpe(String(next))
  }

  // ─── Warmup Screen ───────────────────────────────────────────
  if (needsWarmup) {
    return (
      <div className="page">
        <div className="nav-bar">
          <button className="nav-back" onClick={() => navigate('/')}>
            <span className="nav-back-icon">‹</span>
            Home
          </button>
          <div className="nav-title">Warmup</div>
          <div className="nav-spacer" />
        </div>

        {/* Progress dots */}
        <ProgressDots
          allIds={allExerciseIds}
          completedIds={completedExIds}
          currentId={exerciseId}
          parkedIds={parkedExercises}
        />

        <div className="warmup-screen">
          <div className="warmup-icon">🔥</div>
          <div className="warmup-title">Warm Up First</div>
          <div className="warmup-exercise">{displayName}</div>
          <div className="warmup-sets">
            Perform <strong>{ex.warmupSets} warmup set{ex.warmupSets !== '1' ? 's' : ''}</strong> before
            your working sets.
            <br /><br />
            Use light weight to prepare your joints and activate the target muscle.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
            <button className="btn btn-primary btn-full" onClick={handleAcknowledgeWarmup}>
              Done Warming Up →
            </button>
            <button
              className="skip-btn"
              onClick={() => {
                setWarmupAcknowledged((prev) => ({ ...prev, [exerciseId]: true }))
                setShowSkipConfirm(true)
              }}
            >
              Skip exercise
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Main Set Logging Screen ─────────────────────────────────

  // Pre-fill weight if empty and we have a default
  const effectiveWeight = weight !== '' ? weight : (dropsetPhase ? String(initialWeight) : (lastWeight ? String(lastWeight) : ''))
  const displayWeight = weight

  return (
    <div className="page">
      {/* Nav */}
      <div className="nav-bar">
        <button className="nav-back" onClick={() => navigate('/')}>
          <span className="nav-back-icon">‹</span>
          Home
        </button>
        <div className="nav-title">
          {dropsetPhase ? 'Drop Set' : `Set ${currentItem.setNumber} / ${currentItem.totalSets}`}
        </div>
        <button className="nav-action" onClick={() => setShowNotes(true)}>
          ⓘ
        </button>
      </div>

      {/* Progress dots */}
      <ProgressDots
        allIds={allExerciseIds}
        completedIds={completedExIds}
        currentId={exerciseId}
        parkedIds={parkedExercises}
      />

      <div className="page-content">
        {/* Superset banner */}
        {currentItem.isSuperset && (
          <div className="superset-banner">
            SUPERSET {currentItem.supersetRole === 'A1' ? 'A1 → A2' : 'A2'} — no rest between
          </div>
        )}

        {/* Dropset banner */}
        {dropsetPhase && (
          <div className="dropset-banner">
            ↓ DROP SET — Reduce weight ~50%
          </div>
        )}

        {/* Exercise Header */}
        <div className="exercise-header">
          <div className="exercise-name">{displayName}</div>
          {ex.variant && <div className="exercise-variant">{ex.variant}</div>}
          <div className="exercise-meta">
            <span className="chip">{ex.muscle}</span>
            <span className="chip chip-accent">RPE {ex.rpe}</span>
            {ex.isDropset && !dropsetPhase && (
              <span className="chip" style={{ color: 'var(--red)', background: 'rgba(255,69,58,0.12)' }}>
                Dropset
              </span>
            )}
          </div>
        </div>

        {/* Set info bar */}
        <div className="set-info-bar">
          <div className="set-counter">
            {dropsetPhase ? 'Drop Set' : `Set ${currentItem.setNumber} / ${currentItem.totalSets}`}
          </div>
          <div className="set-target">
            Target: {dropsetPhase ? ex.dropReps : ex.reps} reps
          </div>
        </div>

        {/* Inputs */}
        <div className="input-row" style={{ marginTop: 16 }}>
          {/* Weight */}
          <div className="input-group">
            <div className="input-label">Weight (kg)</div>
            <div className="big-input-wrapper">
              <button className="stepper-btn" onClick={() => adjustWeight(-2.5)}>−</button>
              <input
                className="big-input"
                type="number"
                inputMode="decimal"
                placeholder={dropsetPhase ? String(initialWeight || '') : '0'}
                value={displayWeight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <button className="stepper-btn" onClick={() => adjustWeight(2.5)}>+</button>
            </div>
          </div>

          {/* Reps */}
          <div className="input-group">
            <div className="input-label">Reps</div>
            <div className="big-input-wrapper">
              <button className="stepper-btn" onClick={() => adjustReps(-1)}>−</button>
              <input
                className="big-input"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
              <button className="stepper-btn" onClick={() => adjustReps(1)}>+</button>
            </div>
          </div>
        </div>

        {/* RPE */}
        <div className="rpe-section">
          <div className="input-label" style={{ marginBottom: 8 }}>RPE (optional)</div>
          <div className="rpe-row">
            <button className="stepper-btn btn-sm" style={{ width: 36, height: 36 }} onClick={() => adjustRpe(-0.5)}>−</button>
            <input
              className="rpe-input-small"
              type="number"
              inputMode="decimal"
              min="1"
              max="10"
              step="0.5"
              placeholder={ex.rpe}
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
            />
            <button className="stepper-btn btn-sm" style={{ width: 36, height: 36 }} onClick={() => adjustRpe(0.5)}>+</button>
            <span style={{ fontSize: 13, color: 'var(--text3)', marginLeft: 8 }}>Target: {ex.rpe}</span>
          </div>
        </div>

        {/* Previous sets for this exercise */}
        {logs[exerciseId] && logs[exerciseId].length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div className="section-title" style={{ marginTop: 0 }}>Previous Sets</div>
            <div className="card" style={{ padding: '8px 12px' }}>
              {logs[exerciseId].map((s, i) => (
                <div key={i} className="set-row">
                  <span className="set-num">#{i + 1}</span>
                  <span className="set-weight">
                    {s.weight > 0 ? `${s.weight}kg` : 'BW'}
                  </span>
                  <span className="set-reps">× {s.reps} reps</span>
                  {s.rpe && <span className="set-rpe">RPE {s.rpe}</span>}
                  {s.isDropset && <span className="set-dropset-badge">DROP</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Log button */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            className="btn btn-primary btn-full"
            onClick={handleLogSet}
          >
            {dropsetPhase ? 'Log Drop Set' : 'Log Set'}
          </button>

          {/* Parked pill */}
          {parkedExercises.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                className="parked-pill"
                onClick={() => {
                  const firstParked = parkedExercises[0]
                  if (firstParked) returnParked(firstParked)
                }}
              >
                <span className="parked-pill-count">{parkedExercises.length}</span>
                <span>Skipped — tap to add back</span>
              </div>
            </div>
          )}

          {/* Skip */}
          {!showSkipConfirm ? (
            <button className="skip-btn" onClick={() => setShowSkipConfirm(true)}>
              Skip Exercise
            </button>
          ) : (
            <div className="card" style={{ padding: 12 }}>
              <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12, textAlign: 'center' }}>
                Skip {displayName}?
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm btn-danger" style={{ flex: 1 }} onClick={handleSkip}>
                  Skip
                </button>
                <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => setShowSkipConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ height: 40 }} />
      </div>

      {/* Rest Timer Overlay */}
      {isResting && (
        <RestTimer
          restingUntil={restingUntil}
          nextExerciseId={nextEx?.id}
        />
      )}

      {/* Notes Panel */}
      {showNotes && (
        <NotesPanel exercise={ex} onClose={() => setShowNotes(false)} />
      )}
    </div>
  )
}

// ─── Progress Dots Component ─────────────────────────────────

function ProgressDots({ allIds, completedIds, currentId, parkedIds }) {
  return (
    <div className="progress-dots">
      {allIds.map((id) => {
        const isDone = completedIds.has(id) && id !== currentId
        const isActive = id === currentId
        const isParked = parkedIds.includes(id)
        let cls = 'progress-dot'
        if (isDone) cls += ' done'
        else if (isActive) cls += ' active'
        else if (isParked) cls += ' parked'
        return <div key={id} className={cls} title={EXERCISES[id]?.name || id} />
      })}
    </div>
  )
}
