import React, { useState, useEffect, useRef } from 'react'
import useStore from '../store/useStore.js'
import { EXERCISES } from '../data/workouts.js'

export default function RestTimer({ restingUntil, nextExerciseId }) {
  const skipRestTimer = useStore((s) => s.skipRestTimer)
  const session = useStore((s) => s.session)

  const [remaining, setRemaining] = useState(0)
  const [total, setTotal] = useState(0)
  const totalRef = useRef(0)
  const startRef = useRef(null)

  useEffect(() => {
    if (!restingUntil) return

    const now = Date.now()
    const totalMs = restingUntil - (now - (restingUntil - now > 0 ? 0 : 0))
    // Calculate total duration from the queue item's restAfter
    // We derive it from (restingUntil - when timer was set), approximated as remaining + elapsed
    const rem = Math.max(0, Math.ceil((restingUntil - Date.now()) / 1000))
    if (startRef.current === null) {
      startRef.current = Date.now()
      totalRef.current = rem
      setTotal(rem)
    }
    setRemaining(rem)

    const interval = setInterval(() => {
      const r = Math.max(0, Math.ceil((restingUntil - Date.now()) / 1000))
      setRemaining(r)
      if (r <= 0) {
        clearInterval(interval)
        skipRestTimer()
      }
    }, 250)

    return () => clearInterval(interval)
  }, [restingUntil])

  // Reset startRef when restingUntil changes
  useEffect(() => {
    startRef.current = null
    totalRef.current = 0
  }, [restingUntil])

  const nextEx = nextExerciseId ? EXERCISES[nextExerciseId] : null

  // Get sub name if applicable
  const getDisplayName = (ex) => {
    if (!ex || !session) return ex?.name || ''
    const subIndex = session.substitutions[ex.id]
    if (subIndex !== undefined && ex.subs[subIndex]) {
      return ex.subs[subIndex]
    }
    return ex.name
  }

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`

  // SVG ring
  const r = 96
  const circumference = 2 * Math.PI * r
  const progress = totalRef.current > 0 ? remaining / totalRef.current : 0
  const dashoffset = circumference * (1 - progress)

  return (
    <div className="rest-timer-overlay">
      <div className="rest-timer-label">REST</div>

      <div className="rest-timer-ring">
        <svg width="220" height="220" viewBox="0 0 220 220">
          <circle
            className="rest-timer-track"
            cx="110"
            cy="110"
            r={r}
          />
          <circle
            className="rest-timer-progress"
            cx="110"
            cy="110"
            r={r}
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
          />
        </svg>
        <div className="rest-timer-number">{timeStr}</div>
      </div>

      {nextEx && (
        <>
          <div className="rest-timer-next-label">Up next</div>
          <div className="rest-timer-next">{getDisplayName(nextEx)}</div>
        </>
      )}

      <button
        className="btn btn-ghost mt-32"
        onClick={skipRestTimer}
        style={{ minWidth: 160 }}
      >
        Skip Rest
      </button>
    </div>
  )
}
