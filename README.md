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

- Drag students onto time slots in day or week view
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
- Data lives in two Firestore documents: `data/students` (`{ name: phone }`) and `data/lessons` (`{ "YYYY-MM-DD-HH:MM": name }`).
- Security rules are in `firestore.rules`. Deploy them with `firebase deploy --only firestore`.
- The rules are open, with no login required. Anyone who has the config can read and write these two documents.
