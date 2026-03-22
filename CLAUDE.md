# Essentials Tracker — Claude Context

## What this is
A PWA workout tracker for Jeff Nippard's Essentials Program (12-week hypertrophy, 3x/week).
Built with React 18 + Vite. All data stored in localStorage. Optional Google Apps Script sync.

## Tech stack
- React 18, React Router v6 (HashRouter — required for file:// protocol)
- Zustand with persist middleware (localStorage key: `essentials-tracker`)
- vite-plugin-pwa (service worker + manifest)
- Plain CSS in `src/index.css` — no Tailwind, no CSS modules
- `base: './'` in vite.config.js so built files work from file:// on iPhone

## Project structure
```
src/
  data/workouts.js       — All 45 exercises + 9 workouts + buildSetQueue() helper
  store/useStore.js      — Zustand store: session state, history, actions
  pages/
    Home.jsx             — Week selector, next workout card, resume banner
    WorkoutOverview.jsx  — Pre-workout exercise list, Begin button
    ActiveWorkout.jsx    — Main workout flow (warmup → sets → dropset → rest → next)
    History.jsx          — Past sessions, expandable per-exercise logs
    Settings.jsx         — Week/rotation controls, clear history
  components/
    RestTimer.jsx        — Fullscreen SVG countdown, auto-dismisses at 0
    NotesPanel.jsx       — Slide-up bottom sheet: notes, subs, image placeholder
    WorkoutComplete.jsx  — End-of-workout summary, Finish & Save button
  index.css              — Full design system (CSS variables, all component classes)
  App.jsx                — HashRouter routes
google-apps-script/
  Code.gs                — Paste into Google Apps Script editor for sheet sync
docs/
  essentials-program-workouts.md  — Source program data (Jeff Nippard)
```

## Data model
**Exercise** (defined in EXERCISES object, keyed by id):
- warmupSets, workingSets, reps, rpe, restSeconds
- isDropset, dropReps, lastSetOnly (dropset on last set only vs every set)
- supersetGroup ('A'), supersetOrder (1 or 2) — A1 rest=0, A2 has actual rest
- subs: [sub1name, sub2name]

**Session** (in store.session during workout):
- queue: flat array of `{ exerciseId, setNumber, totalSets, restAfter, isSuperset, supersetRole }`
- queueIndex: current position
- logs: `{ exerciseId: [{ setNumber, weight, reps, rpe, isDropset }] }`
- parkedExercises: skipped exercise IDs
- dropsetPhase: true when logging drop portion
- restingUntil: timestamp, drives RestTimer overlay
- substitutions: `{ exerciseId: 0|1 }` — active sub index

**buildSetQueue()** in workouts.js: flattens a workout into a set-by-set queue. Supersets are interleaved A1-set1, A2-set1, A1-set2, A2-set2.

## Cloud sync (optional)
`APPS_SCRIPT_URL` at top of `src/store/useStore.js`. Fire-and-forget POST on `finishWorkout()`. App works fully offline if URL is empty. Source file: `google-apps-script/Code.gs`.

## Development
```bash
npm run dev       # http://localhost:5173
npm run build     # outputs to dist/ — this is what goes on the phone
```

## Key conventions
- HashRouter is intentional — do not switch to BrowserRouter (breaks file:// protocol)
- All workout data lives in src/data/workouts.js — single source of truth
- CSS variables for all colours — see :root in index.css before adding new styles
- Zustand store is flat — no nested slices
- Do not add a backend or auth — this is intentionally a local-first app
