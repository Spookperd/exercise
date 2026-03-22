# Essentials Tracker

A mobile-first PWA for tracking Jeff Nippard's Essentials Program. Works offline, installs to your iPhone home screen, no account required.

**Program:** 12 weeks · 3x/week · Full Body / Upper / Lower rotation
**Data:** Stored locally on device (localStorage). Optional Google Sheets backup.

---

## iPhone Setup

### Step 1 — Build the app
```bash
npm install
npm run build
```
This produces a `dist/` folder — that's the complete app.

### Step 2 — Get it onto your iPhone

**Option A — AirDrop (easiest)**
1. AirDrop the entire `dist/` folder to your iPhone
2. Save it somewhere in the Files app (e.g. On My iPhone)
3. Open the Files app → navigate to `dist/` → tap `index.html`
4. It opens in Safari

**Option B — iCloud Drive**
1. Copy the `dist/` folder into iCloud Drive on your Mac
2. On iPhone: Files app → iCloud Drive → dist → tap `index.html`

### Step 3 — Add to Home Screen
1. With the app open in Safari, tap the **Share** button (box with arrow)
2. Scroll down → tap **Add to Home Screen**
3. Name it "Essentials" → tap Add
4. The app now launches full-screen from your home screen like a native app

> Re-do steps 2–3 after each rebuild if you update the app.

---

## Google Sheets Sync (optional)

Syncs completed workouts to a Google Sheet as a backup. The app works fully without this.

### Setup

**1. Create the Sheet**
- Go to [sheets.google.com](https://sheets.google.com) → new spreadsheet → name it "Essentials Tracker"
- In row 1, add these headers exactly: `id` | `date` | `workout` | `duration` | `data`

**2. Add the Apps Script**
- In the sheet: Extensions → Apps Script
- Delete all existing code
- Paste the contents of `google-apps-script/Code.gs`
- Click Save (floppy disk icon)

**3. Deploy**
- Click Deploy → New deployment
- Click the gear icon next to "Type" → select **Web app**
- Set: Execute as → **Me**, Who has access → **Anyone**
- Click Deploy → copy the URL

**4. Add the URL to the app**
- Open `src/store/useStore.js`
- Paste the URL into line 7:
  ```js
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ID/exec'
  ```
- Run `npm run build` again

**Verify it works:** paste the URL in a browser — you should see `{"ok":true,"sessions":[]}`.

After setup, every completed workout is automatically synced to the Sheet. If offline or the sync fails, nothing is lost — localStorage is always the source of truth.

> **Note:** If you edit the Apps Script code later, redeploy using Manage Deployments → Edit on the existing deployment (not New deployment) to keep the same URL.

---

## Using the App

### Starting a workout
1. Set your current week (1–12) on the Home screen
2. The app shows your next workout (Full Body → Upper → Lower → repeat)
3. Tap **Start Workout** to see the exercise list
4. Tap **Begin** to start logging

### Logging sets
- Each exercise shows one set at a time
- Enter **weight** (kg) and **reps**, then tap **Log Set**
- RPE is optional — fill it in on the last set if you want to track effort
- Previous session's weight is pre-filled automatically

### Warm-up sets
- When an exercise has warm-up sets, a warm-up screen appears first
- Complete your warm-ups, then tap **Done — Start Working Sets**
- Warm-up sets are not logged, just acknowledged

### Rest timer
- Starts automatically after each logged set
- Tap **Skip Rest** to move on early
- Timer shows what exercise is coming next

### Dropsets
- After the main set, a **DROP SET** screen appears automatically
- Weight is pre-filled at ~50% of your working weight
- Log the drop reps, then rest timer starts

### Supersets
- A1 and A2 exercises are shown back-to-back with an orange SUPERSET banner
- No rest between A1 and A2 — rest only after A2

### Skipping a machine
- Tap **Skip Exercise** if a machine is occupied
- The exercise moves to a parked queue (shown as a badge)
- Tap the badge to return a parked exercise — it's added to the end of the queue

### Substitutions
- Tap the **info icon** on any exercise to open the notes panel
- Each exercise has two substitution options — tap one to swap for the session
- Substitutions don't affect sets, reps, or RPE

---

## Progression (Jeff Nippard's method)

| Week | Goal |
|------|------|
| 1 | Establish working weights, hit bottom of rep range |
| 2 | Add reps within the range |
| 3 | Reach top of rep range |
| 4 | Add weight, return to bottom of rep range |

Repeat each 4-week block. Exercises rotate every block to keep training fresh.

**RPE guide:** RPE 10 = nothing left, RPE 9 = 1 rep left, RPE 8 = 2 reps left.
Target RPE applies to the **last set** — earlier sets will feel easier, that's normal.

---

## Planned Features

### Near-term
- [ ] **Progress charts** — line graphs per exercise showing weight over sessions
- [ ] **Plate calculator** — enter total weight, get barbell plate breakdown
- [ ] **Exercise images** — replace placeholders with actual photos (tap to add from camera roll)
- [ ] **Custom notes per set** — free-text field on each logged set
- [ ] **Body weight exercises** — option to log bodyweight + added weight (e.g. dips with +20kg)

### Quality of life
- [ ] **Rest timer vibration** — haptic feedback when timer ends (Vibration API)
- [ ] **One-rep max estimator** — calculated from logged weight × reps using Epley formula
- [ ] **Dark/light mode toggle** — currently always dark
- [ ] **Landscape lock warning** — nudge to stay portrait during sets
- [ ] **Workout notes** — free-text field per session (how you felt, gym busy, etc.)

### Bigger features
- [ ] **Custom workout builder** — create your own program structure
- [ ] **Deload week** — automatic reduced volume every 4th week option
- [ ] **Export to CSV** — download full history as spreadsheet
- [ ] **Import from CSV** — restore history from backup
- [ ] **Share a session** — use iOS Share Sheet to send a workout summary as text
- [ ] **Multiple programs** — switch between different Jeff Nippard programs
- [ ] **Streak tracking** — consecutive weeks completed

---

## Development

```bash
npm install        # install dependencies
npm run dev        # dev server at localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build locally
```

### Key files
| File | Purpose |
|------|---------|
| `src/data/workouts.js` | All program data — exercises, workouts, set queue builder |
| `src/store/useStore.js` | All app state — session, history, actions |
| `src/pages/ActiveWorkout.jsx` | Main workout flow logic |
| `src/index.css` | Entire design system (CSS variables + component styles) |
| `google-apps-script/Code.gs` | Paste into Google Apps Script for sheet sync |
| `CLAUDE.md` | Context file for Claude Code |

---

**Source program:** The Essentials Program by Jeff Nippard · jeffnippard.com
