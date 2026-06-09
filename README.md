# BalanceBoard

BalanceBoard is a first-pass React prototype for visualizing co-parenting custody time, kid activities, transitions, and time-balance statistics across June, July, and August 2026.

## Run Locally

```bash
npm install
npm run dev
```

Build the production bundle with:

```bash
npm run build
```

## Project Shape

- `src/data/mockSchedule.ts` contains the local mock children, recurring activities, one-off activities, biweekly custody pattern, and transitions.
- `src/data/config.json` contains the number of kids, child wake/bed times, weekend days, summer vacation dates, parents, visible months, and weekly custody pattern.
- `src/data/kid-*.activities.json`, `src/data/kid-*.classes.json`, and `src/data/kid-*.special.json` contain per-child one-off activities, recurring classes, and custody-overriding special periods.
- `src/utils/dates.ts` contains shared date helpers powered by day.js and its week-of-year plugin.
- `src/utils/custodyStats.ts` calculates monthly hours, weekly hours, percentage split, longest stretches away from each parent, and the next transition.
- `src/components/` contains the app shell, calendar, legend, and stats cards.

## Later Replacement Points

The prototype has no backend, auth, persistence, database, or routing. When real rules are ready, replace the weekly resolver in `src/data/mockSchedule.ts` with a service-backed or rules-engine-backed schedule generator, then keep the UI consuming the same `CustodyDay` shape.
