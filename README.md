# TeacherScheduler

A scheduling tool for private teachers — drag-and-drop weekly/daily calendar with real-time sync and WhatsApp lesson reminders.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite |
| Database | Firebase Cloud Firestore (real-time sync) |
| Backend | Node.js, Express 5 (WhatsApp sending only) |
| Messaging | whatsapp-web.js (headless Chromium) |

## Features

- Drag students onto time slots in day or week view (long-press to drag on touch screens)
- Tap/click a student to add a lesson by date and time range
- Fixed weekly lessons: same day and hours every week; removing one from the table cancels only that week
- Live multi-client sync via Firestore
- Send WhatsApp lesson reminders to all students in one click
- Student management (add / delete / import JSON)

## Run with Docker (recommended)

```bash
docker compose up -d --build
```

- App: http://localhost:8090 (nginx serves the built frontend and proxies `/api` to the backend)
- First run: scan the WhatsApp QR code shown in `docker compose logs -f backend`. The session is kept in the `wwebjs_auth` volume, so you only scan once.

Stop with `docker compose down`. Add `-v` to also delete the WhatsApp session.

## Run locally (development)

Requires Node.js ≥ 18.

```bash
cd backend && npm install && node index.js     # API on :3001, prints WhatsApp QR
cd frontend && npm install && npm run dev      # http://localhost:5173
```

## Firebase

- Project: `teacherscheduler-8b645`; config is in `frontend/src/firebase.js`.
- Data lives in Firestore documents: `data/students` (`{ name: phone }`), `data/lessons` (`{ "YYYY-MM-DD-HH:MM": name }`), `data/recurring` (fixed weekly lessons, `{ "<weekday 0-6>-HH:MM": name }`) and `data/skips` (single fixed-lesson weeks removed, `{ "YYYY-MM-DD-HH:MM": true }`).
- Security rules are in `firestore.rules`. Deploy them with `firebase deploy --only firestore`.
- The rules are open, with no login required. Anyone who has the config can read and write these documents.

## CI/CD

`.github/workflows/deploy.yml` deploys to the VPS over SSH on every push to `master`. It clones the repo to `/home/TeacherScheduler` on the first run, then runs `git pull` and `docker compose up -d --build`. The frontend is built inside its Docker image. If the build fails, the running containers are left as they were.

Required repository secrets:

| Secret | Value |
|---|---|
| `VPS_HOST` | VPS IP or hostname |
| `VPS_SSH_KEY` | Private SSH key for `root` on the VPS |

The VPS needs Docker with the Compose plugin. After the first deploy, scan the WhatsApp QR code from `docker compose logs -f backend` on the VPS. Firestore rules are not deployed by the pipeline.
