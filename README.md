# TeacherScheduler

A scheduling tool for private teachers — drag-and-drop weekly/daily calendar with real-time sync and WhatsApp lesson reminders.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Socket.IO client |
| Backend | Node.js, Express 5, Socket.IO server |
| Messaging | whatsapp-web.js |

## Features

- Drag students onto time slots in day or week view
- Live multi-client sync via Socket.IO
- Send WhatsApp lesson reminders to all students in one click
- Student management (add / delete / edit phone numbers)
- Persistent schedule stored as JSON on disk

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A WhatsApp account (used for sending reminders)

### Backend

```bash
cd backend
npm install
node index.js
```

On first run, a QR code is printed to the terminal. Scan it with WhatsApp to authenticate. The session is persisted locally so subsequent runs skip the QR step.

Ports:
- `3001` — REST API
- `3002` — Socket.IO

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Data

Student records and the lesson schedule are stored in `backend/data/` (created automatically on first run, excluded from version control).
