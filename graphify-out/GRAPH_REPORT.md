# Graph Report - TeacherScheduler  (2026-06-04)

## Corpus Check
- 19 files · ~4,113 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 119 nodes · 150 edges · 10 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d0b90a24`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]

## God Nodes (most connected - your core abstractions)
1. `formatTimeSlot()` - 8 edges
2. `useStudents()` - 7 edges
3. `ensureDataFile()` - 6 edges
4. `scripts` - 5 edges
5. `formatHourRange()` - 5 edges
6. `TeacherScheduler` - 5 edges
7. `atomicWrite()` - 4 edges
8. `WeekView()` - 4 edges
9. `Getting Started` - 4 edges
10. `writeStudents()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `formatTimeSlot()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/utils/dateUtils.js
- `Sidebar()` --calls--> `useStudents()`  [EXTRACTED]
  frontend/src/components/Sidebar.jsx → frontend/src/context/StudentsContext.jsx
- `StudentsEditor()` --calls--> `useStudents()`  [EXTRACTED]
  frontend/src/components/StudentsEditor.jsx → frontend/src/context/StudentsContext.jsx
- `App()` --calls--> `useStudents()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/context/StudentsContext.jsx
- `DayView()` --calls--> `formatHourRange()`  [EXTRACTED]
  frontend/src/components/DayView.jsx → frontend/src/utils/dateUtils.js

## Import Cycles
- None detected.

## Communities (10 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (22): app, atomicWrite(), client, { Client, LocalAuth }, cors, DATA_DIR, ensureDataFile(), express (+14 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (19): dependencies, lucide-react, rdndmb-html5-to-touch, react, react-dnd, react-dnd-html5-backend, react-dnd-multi-backend, react-dnd-touch-backend (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (16): author, dependencies, cors, express, qrcode-terminal, socket.io, whatsapp-web.js, description (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.21
Nodes (7): Sidebar(), StudentsEditor(), StudentsContext, StudentsProvider(), useStudents(), App(), socket

### Community 4 - "Community 4"
Cohesion: 0.35
Nodes (8): DayView(), WeekView(), DAYS_OF_WEEK, HOURS, formatDate(), formatHourRange(), formatTimeSlot(), getWeekDates()

### Community 5 - "Community 5"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/react, @types/react-dom (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.22
Nodes (8): Backend, Data, Features, Frontend, Getting Started, Prerequisites, Stack, TeacherScheduler

### Community 7 - "Community 7"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **65 isolated node(s):** `fs`, `cors`, `path`, `http`, `fsp` (+60 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Community 5` to `Community 1`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `fs`, `cors`, `path` to the rest of the system?**
  _65 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09401709401709402 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._