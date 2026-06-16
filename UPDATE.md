# Whereabouts update — agent runbook

This is the instruction set for the scheduled Claude agent that keeps
`status.json` truthful. It runs twice a day (morning + evening, Melbourne time).
Milly never edits the site by hand; this file is the only "logic".

## Goal

Decide where Milly is **right now** and write it to `status.json`. One of:

| status      | answer | line                                              |
|-------------|--------|---------------------------------------------------|
| `melbourne` | YES    | Milly is currently in Melbourne, business as usual.|
| `sydney`    | NO     | Milly is currently in Sydney.                     |
| `elsewhere` | NO     | Milly is currently somewhere else.                |

## How to decide

1. Establish "today" in `Australia/Melbourne`.
2. Read the **calendar** for today and tomorrow (primary calendar).
3. Search **email** for travel in a ±5 day window: flights, boarding passes,
   hotel/Airbnb confirmations, e.g. queries like
   `(flight OR "boarding pass" OR hotel OR Airbnb OR itinerary) newer_than:10d`.

### Rules (in order)

- **Default is `melbourne`.** Only move off it with *positive physical evidence*
  that Milly is somewhere else on this date.
- **Physical evidence** = a calendar event with a real interstate/overseas street
  address, an all-day "travel"/out-of-office block naming another city, or a flight
  itinerary that puts her away on today's date.
- **NOT evidence** (ignore these — they're desk-based work):
  - Events whose location is a Zoom / Google Meet / phone link.
  - Atlassian meetings tagged in `Australia/Sydney` timezone but with no physical
    Sydney address. Sydney *timezone* ≠ physically in Sydney.
- If physically away **in Sydney** → `sydney`. If physically away **elsewhere**
  (other city / interstate / overseas) → `elsewhere`.
- **When genuinely unsure → `melbourne`** (Milly prefers a confident YES over a
  false "away").

## Then write the file

Overwrite `status.json` with:

```json
{
  "status": "melbourne|sydney|elsewhere",
  "updated": "<ISO 8601, Australia/Melbourne offset>",
  "confidence": "high|medium|low",
  "note": "<one line: the evidence you used>"
}
```

## Then publish

If `status.json` changed, commit and push so GitHub Pages redeploys:

```
git add status.json
git commit -m "whereabouts: <status> (<note>)"
git push origin main
```

If nothing changed, still update `updated`/`note` so the "last checked" stamp
stays fresh, commit, and push.
