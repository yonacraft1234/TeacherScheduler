const fs = require('fs');
const cors = require('cors');
const path = require('path');
const http = require('http');
const fsp = require('fs/promises');
const express = require('express');
const { Server } = require('socket.io');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
app.use(cors());
app.use(express.json());

// Create a dedicated Socket.IO server on a separate port
const ioServer = http.createServer();
const io = new Server(ioServer, {
  cors: { origin: '*' }
});

// Remove stale Chromium profile locks left by a previous container (different hostname)
const authPath = process.env.WWEBJS_AUTH_PATH || path.join(__dirname, '.wwebjs_auth');
for (const f of ['SingletonLock', 'SingletonSocket', 'SingletonCookie']) {
  try { fs.rmSync(path.join(authPath, 'session', f), { force: true }); } catch { /* ignore */ }
}

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: process.env.WWEBJS_AUTH_PATH }),
  puppeteer: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', (qr) => {
  console.log('Scan this QR to authenticate:');
  qrcode.generate(qr, { small: true });
});

let whatsappReady = false;

client.on('authenticated', () => console.log('WhatsApp authenticated'));
client.on('auth_failure', (m) => console.error('WhatsApp auth failure:', m));
client.on('loading_screen', (pct) => console.log(`WhatsApp loading ${pct}%`));
client.on('disconnected', (r) => { whatsappReady = false; console.log('WhatsApp disconnected:', r); });

client.on('ready', () => {
  whatsappReady = true;
  console.log('WhatsApp client is ready');
});

client.initialize();

// Convert 05xxxxxxxx to 9725xxxxxxxx@c.us
const toWhatsAppId = (raw) => {
  const digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return `972${digits.slice(1)}@c.us`;
  }
  if (digits.startsWith('972')) {
    return `${digits}@c.us`;
  }
  return `${digits}@c.us`;
};

const formatDateHe = (input) => {
  const d = new Date(input);
  if (isNaN(d)) return String(input);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const weekday = new Intl.DateTimeFormat('he-IL', { weekday: 'long', timeZone: 'Asia/Jerusalem' }).format(d);
  return `${dd}/${mm}, ${weekday}`;
};

// ---- Students storage (JSON file) ----
const DATA_DIR = path.join(__dirname, 'data');
const STUDENTS_PATH = path.join(DATA_DIR, 'students.json');
const LESSONS_PATH = path.join(DATA_DIR, 'lessons.json');

/** Ensure data directory/file exist */
async function ensureDataFile() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  try {
    await fsp.access(STUDENTS_PATH, fs.constants.F_OK);
  } catch {
    const seed = {
      "yonatan": "0585230230",
      "sapir": "0585252252",
      "doron": "0506202272",
      "arzit": "0536658264"
    };
    await atomicWrite(STUDENTS_PATH, JSON.stringify(seed, null, 2));
  }
  try {
    await fsp.access(LESSONS_PATH, fs.constants.F_OK);
  } catch {
    await atomicWrite(LESSONS_PATH, JSON.stringify({}, null, 2));
  }
}

async function readStudents() {
  await ensureDataFile();
  const buf = await fsp.readFile(STUDENTS_PATH, 'utf8');
  const obj = JSON.parse(buf || '{}');
  if (!obj || typeof obj !== 'object') return {};
  return obj;
}

async function writeStudents(obj) {
  await ensureDataFile();
  await atomicWrite(STUDENTS_PATH, JSON.stringify(obj, null, 2));
}

async function readLessons() {
  await ensureDataFile();
  const buf = await fsp.readFile(LESSONS_PATH, 'utf8');
  const obj = JSON.parse(buf || '{}');
  if (!obj || typeof obj !== 'object') return {};
  return obj;
}

async function writeLessons(obj) {
  await ensureDataFile();
  await atomicWrite(LESSONS_PATH, JSON.stringify(obj, null, 2));
}

// Atomic write helper: write to temp then rename
async function atomicWrite(targetPath, data) {
  const tmpPath = `${targetPath}.tmp`;
  await fsp.writeFile(tmpPath, data);
  await fsp.rename(tmpPath, targetPath);
}

function normalizeName(name) {
  return String(name || '').trim();
}

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits;
}

// ---- Students API ----
app.get('/api/students', async (req, res) => {
  try {
    const students = await readStudents();
    res.json({ ok: true, students });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { name, phone } = req.body || {};
    const n = normalizeName(name);
    const p = normalizePhone(phone);
    if (!n) return res.status(400).json({ ok: false, error: 'שם נדרש' });
    if (!p) return res.status(400).json({ ok: false, error: 'מספר טלפון נדרש' });
    const students = await readStudents();
    if (students[n]) return res.status(409).json({ ok: false, error: 'שם כבר קיים' });
    students[n] = p;
    await writeStudents(students);
    res.status(201).json({ ok: true, students });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.delete('/api/students/:name', async (req, res) => {
  try {
    const n = normalizeName(req.params.name);
    const students = await readStudents();
    if (!students[n]) return res.status(404).json({ ok: false, error: 'לא נמצא' });
    delete students[n];
    await writeStudents(students);
    res.json({ ok: true, students });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Replace entire collection
app.put('/api/students', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ ok: false, error: 'מטען לא תקין' });
    }
    const next = {};
    for (const [k, v] of Object.entries(payload)) {
      const n = normalizeName(k);
      const p = normalizePhone(v);
      if (!n || !p) continue; // skip invalid entries
      next[n] = p;
    }
    await writeStudents(next);
    res.json({ ok: true, students: next });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/send-lessons', async (req, res) => {
  try {
    if (!whatsappReady) {
      return res.status(503).json({ ok: false, error: 'WhatsApp not connected - scan the QR in the backend logs' });
    }
    const { lessons = [] } = req.body;

    const sendJobs = lessons.map(async (l) => {
      const to = toWhatsAppId(l.phone);
      const msg = [
        `היי ${l.name},`,
        `השיעור שלך נקבע:`,
        `תאריך: ${formatDateHe(l.date)}`,
        `שעה: ${l.start_hour} - ${l.end_hour}`
      ].join('\n');
      await client.sendMessage(to, msg);
      return { to, ok: true };
    });

    const results = await Promise.allSettled(sendJobs);
    results.filter(r => r.status === 'rejected').forEach(r => console.error('Send failed:', r.reason?.message || r.reason));
    res.json({
      ok: true,
      sent: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---- Lessons (schedule) API ----
// Data shape: { ["YYYY-MM-DD-HH:MM"]: "StudentName" }
app.get('/api/lessons', async (req, res) => {
  try {
    const lessons = await readLessons();
    res.json({ ok: true, lessons });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.put('/api/lessons', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ ok: false, error: 'מטען לא תקין' });
    }
    // sanitize: only string keys and string values
    const next = {};
    for (const [k, v] of Object.entries(payload)) {
      if (typeof k !== 'string') continue;
      if (typeof v !== 'string') continue;
      const key = k.trim();
      const val = v.trim();
      if (!key || !val) continue;
      next[key] = val;
    }
    await writeLessons(next);
    res.json({ ok: true, lessons: next });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---- Socket.IO wiring ----
io.on('connection', async (socket) => {
  try {
    const [students, lessons] = await Promise.all([readStudents(), readLessons()]);
    socket.emit('students:list', students);
    socket.emit('lessons:list', lessons);
  } catch (e) {
    // ignore initial send errors
  }

  // Students operations
  socket.on('students:add', async (payload, ack) => {
    try {
      const { name, phone } = payload || {};
      const n = normalizeName(name);
      const p = normalizePhone(phone);
      if (!n) return ack && ack({ ok: false, error: 'שם נדרש' });
      if (!p) return ack && ack({ ok: false, error: 'מספר טלפון נדרש' });
      const students = await readStudents();
      if (students[n]) return ack && ack({ ok: false, error: 'שם כבר קיים' });
      students[n] = p;
      await writeStudents(students);
      io.emit('students:list', students);
      ack && ack({ ok: true });
    } catch (e) {
      ack && ack({ ok: false, error: e.message });
    }
  });

  socket.on('students:remove', async (name, ack) => {
    try {
      const n = normalizeName(name);
      const students = await readStudents();
      if (!students[n]) return ack && ack({ ok: false, error: 'לא נמצא' });
      delete students[n];
      await writeStudents(students);
      io.emit('students:list', students);
      ack && ack({ ok: true });
    } catch (e) {
      ack && ack({ ok: false, error: e.message });
    }
  });

  socket.on('students:replace', async (obj, ack) => {
    try {
      const payload = obj && typeof obj === 'object' ? obj : {};
      const next = {};
      for (const [k, v] of Object.entries(payload)) {
        const n = normalizeName(k);
        const p = normalizePhone(v);
        if (!n || !p) continue;
        next[n] = p;
      }
      await writeStudents(next);
      io.emit('students:list', next);
      ack && ack({ ok: true });
    } catch (e) {
      ack && ack({ ok: false, error: e.message });
    }
  });

  // Lessons (schedule) operations
  socket.on('lessons:set', async (obj, ack) => {
    try {
      const payload = obj && typeof obj === 'object' ? obj : {};
      const next = {};
      for (const [k, v] of Object.entries(payload)) {
        if (typeof k !== 'string') continue;
        if (typeof v !== 'string') continue;
        const key = k.trim();
        const val = v.trim();
        if (!key || !val) continue;
        next[key] = val;
      }
      await writeLessons(next);
      io.emit('lessons:list', next);
      ack && ack({ ok: true });
    } catch (e) {
      ack && ack({ ok: false, error: e.message });
    }
  });

  socket.on('send-lessons', async (payload, ack) => {
    try {
      const { lessons = [] } = payload || {};
      const sendJobs = lessons.map(async (l) => {
        const to = toWhatsAppId(l.phone);
        const msg = [
          `היי ${l.name},`,
          `השיעור שלך נקבע:`,
          `תאריך: ${formatDateHe(l.date)}`,
          `שעה: ${l.start_hour} - ${l.end_hour}`
        ].join('\n');
        await client.sendMessage(to, msg);
        return { to, ok: true };
      });
      const results = await Promise.allSettled(sendJobs);
      const data = {
        ok: true,
        sent: results.filter(r => r.status === 'fulfilled').length,
        failed: results.filter(r => r.status === 'rejected').length,
      };
      ack && ack(data);
    } catch (e) {
      ack && ack({ ok: false, error: e.message });
    }
  });
});

const API_PORT = 3001;
const SOCKET_PORT = 3002;
app.listen(API_PORT, () => console.log(`API listening on http://localhost:${API_PORT}`));
ioServer.listen(SOCKET_PORT, () => console.log(`Socket.IO listening on http://localhost:${SOCKET_PORT}`));
