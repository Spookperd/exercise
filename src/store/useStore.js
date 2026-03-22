import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildSetQueue, EXERCISES, WORKOUTS } from '../data/workouts.js'

// Paste your Apps Script deployment URL here after setup.
// Leave empty to disable cloud sync (app works fine without it).
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzOwyJDVHERhvhgyWK0U_lvjgt4fTUEUe1rJq0TBOsvXVMGIXCXe0TXA1aw_cnbvbiC/exec'

function syncToSheet(session) {
  if (!APPS_SCRIPT_URL) return
  const workout = WORKOUTS.find((w) => w.id === session.workoutId)
  const durationMin = session.completedAt
    ? Math.round((session.completedAt - session.startedAt) / 60000)
    : 0
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({
      id: session.id,
      date: new Date(session.startedAt).toISOString(),
      workout: workout ? `${workout.name} — Block ${workout.block}` : session.workoutId,
      duration: durationMin + ' min',
      data: session.logs,
    }),
  }).catch(() => {
    // silent fail — localStorage is the source of truth
  })
}

const useStore = create(
  persist(
    (set, get) => ({
      // ─── Settings ───────────────────────────────────────────
      currentWeek: 1,
      workoutRotation: 0, // 0=fullbody, 1=upper, 2=lower

      // ─── Active session ──────────────────────────────────────
      session: null,

      // ─── History ─────────────────────────────────────────────
      history: [],

      // ─── Per-exercise defaults ────────────────────────────────
      exerciseDefaults: {},

      // ─── Actions ─────────────────────────────────────────────

      setCurrentWeek: (week) => {
        set({ currentWeek: Math.max(1, Math.min(12, week)) })
      },

      startWorkout: (workoutId) => {
        const queue = buildSetQueue(workoutId, {})
        const session = {
          id: String(Date.now()),
          workoutId,
          startedAt: Date.now(),
          queue,
          queueIndex: 0,
          parkedExercises: [],
          substitutions: {},
          logs: {},
          dropsetPhase: false,
          restingUntil: null,
          completedAt: null,
        }
        set({ session })
      },

      logSet: (weight, reps, rpe) => {
        const { session, exerciseDefaults } = get()
        if (!session) return

        const { queue, queueIndex, logs, dropsetPhase } = session
        const currentItem = queue[queueIndex]
        if (!currentItem) return

        const { exerciseId, setNumber } = currentItem
        const ex = EXERCISES[exerciseId]
        if (!ex) return

        const logEntry = {
          setNumber,
          weight: parseFloat(weight) || 0,
          reps: parseInt(reps) || 0,
          rpe: parseFloat(rpe) || null,
          isDropset: dropsetPhase,
          timestamp: Date.now(),
        }

        // Append to logs
        const updatedLogs = { ...logs }
        if (!updatedLogs[exerciseId]) updatedLogs[exerciseId] = []
        updatedLogs[exerciseId] = [...updatedLogs[exerciseId], logEntry]

        // Update exercise defaults
        const updatedDefaults = {
          ...exerciseDefaults,
          [exerciseId]: { weight: parseFloat(weight) || 0 },
        }

        // Determine if we should enter dropset phase after this set
        const isLastSet = setNumber === currentItem.totalSets
        const shouldDropset =
          ex.isDropset &&
          !dropsetPhase &&
          (!ex.lastSetOnly || isLastSet)

        if (shouldDropset) {
          // Enter dropset phase — stay on same queue item
          set({
            session: {
              ...session,
              logs: updatedLogs,
              dropsetPhase: true,
            },
            exerciseDefaults: updatedDefaults,
          })
          return
        }

        // Done with this queue item, determine rest and advance
        const restAfter = dropsetPhase ? currentItem.restAfter : currentItem.restAfter
        const restingUntil = restAfter > 0 ? Date.now() + restAfter * 1000 : null

        // Check if we're done
        const nextIndex = queueIndex + 1
        const isDone = nextIndex >= queue.length

        set({
          session: {
            ...session,
            queueIndex: nextIndex,
            logs: updatedLogs,
            dropsetPhase: false,
            restingUntil,
            completedAt: isDone ? Date.now() : null,
          },
          exerciseDefaults: updatedDefaults,
        })
      },

      skipRestTimer: () => {
        const { session } = get()
        if (!session) return
        set({ session: { ...session, restingUntil: null } })
      },

      skipExercise: () => {
        const { session } = get()
        if (!session) return

        const { queue, queueIndex, parkedExercises } = session
        const currentItem = queue[queueIndex]
        if (!currentItem) return

        const skipId = currentItem.exerciseId
        const partnerIds = new Set([skipId])

        // Also skip superset partner if applicable
        if (currentItem.supersetPartner) {
          partnerIds.add(currentItem.supersetPartner)
        }

        // Remove all remaining queue items for these exercise IDs
        const newQueue = queue.filter((item, idx) => {
          if (idx < queueIndex) return true // keep past items
          return !partnerIds.has(item.exerciseId)
        })

        const newParked = [...parkedExercises]
        for (const id of partnerIds) {
          if (!newParked.includes(id)) newParked.push(id)
        }

        set({
          session: {
            ...session,
            queue: newQueue,
            parkedExercises: newParked,
            dropsetPhase: false,
            restingUntil: null,
          },
        })
      },

      returnParked: (exerciseId) => {
        const { session } = get()
        if (!session) return

        const { queue, parkedExercises } = session
        const ex = EXERCISES[exerciseId]
        if (!ex) return

        // Build queue items for this exercise
        const totalSets = ex.workingSets
        const newItems = []
        for (let s = 1; s <= totalSets; s++) {
          newItems.push({
            exerciseId,
            setNumber: s,
            totalSets,
            restAfter: ex.restSeconds,
            isSuperset: false,
            supersetPartner: null,
            supersetRole: null,
          })
        }

        const newQueue = [...queue, ...newItems]
        const newParked = parkedExercises.filter((id) => id !== exerciseId)

        set({
          session: {
            ...session,
            queue: newQueue,
            parkedExercises: newParked,
          },
        })
      },

      setSubstitution: (exerciseId, subIndex) => {
        const { session } = get()
        if (!session) return
        set({
          session: {
            ...session,
            substitutions: {
              ...session.substitutions,
              [exerciseId]: subIndex,
            },
          },
        })
      },

      finishWorkout: () => {
        const { session, history, workoutRotation } = get()
        if (!session) return

        const completedSession = {
          ...session,
          completedAt: session.completedAt || Date.now(),
        }

        syncToSheet(completedSession)

        const newRotation = (workoutRotation + 1) % 3

        set({
          session: null,
          history: [completedSession, ...history],
          workoutRotation: newRotation,
        })
      },

      deleteSession: (id) => {
        set((state) => ({ history: state.history.filter((s) => s.id !== id) }))
      },

      clearHistory: () => {
        set({ history: [] })
      },
    }),
    {
      name: 'essentials-tracker',
    }
  )
)

export default useStore
