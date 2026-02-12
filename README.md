# CampusCare Pulse (Hackathon Prototype)

A standout, school-focused customer service prototype for a private-school hackathon.

## Why this stands out

- **School context built-in**: parent/guardian, student, grade, and category workflows.
- **AI-like triage**: rule-based sentiment + priority detection from request text.
- **Operational intelligence**: open cases, SLA risk counters, and a dynamic insight feed.
- **Team operations**: auto-assignment by domain (finance, transport, student support, etc.).
- **Premium UX**: clean dashboard layout designed for admissions and family-experience teams.

## Run locally

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Suggested hackathon demo flow (3 minutes)

1. Submit an urgent wellbeing issue to trigger **High priority + Concerned sentiment**.
2. Show it appears as **Unassigned**, then click **Auto-assign New Cases**.
3. Update status to **In Progress** and show KPI / insight behavior.
4. Switch language to show multilingual readiness for international families.
