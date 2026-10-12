# Graph Report - TeacherScheduler  (2026-10-12)

## Corpus Check
- 21 files · ~5,444 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 142 nodes · 191 edges · 11 communities (10 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9e34420b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]

## God Nodes (most connected - your core abstractions)
1. `formatTimeSlot()` - 8 edges
2. `TeacherScheduler` - 8 edges
3. `useStudents()` - 7 edges
4. `ensureDataFile()` - 6 edges
5. `App()` - 6 edges
6. `firestore` - 5 edges
7. `scripts` - 5 edges
8. `HOURS` - 5 edges
9. `getWeekDates()` - 5 edges
10. `formatHourRange()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useStudents()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/context/StudentsContext.jsx
- `Sidebar()` --calls--> `useStudents()`  [EXTRACTED]
  frontend/src/components/Sidebar.jsx → frontend/src/context/StudentsContext.jsx
- `App()` --calls--> `formatDate()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/utils/dateUtils.js
- `App()` --calls--> `formatTimeSlot()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/utils/dateUtils.js
- `App()` --calls--> `getSlotWeekday()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/utils/dateUtils.js

## Import Cycles
- None detected.

## Communities (11 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (22): app, atomicWrite(), client, { Client, LocalAuth }, cors, DATA_DIR, ensureDataFile(), express (+14 more)

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (15): Sidebar(), END_HOURS, groupFixed(), StudentsEditor(), StudentsContext, StudentsProvider(), useStudents(), app (+7 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (16): author, dependencies, cors, express, qrcode-terminal, socket.io, whatsapp-web.js, description (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (16): firestore, database, indexes, location, rules, dependencies, firebase, lucide-react (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.25
Nodes (10): DayView(), WeekView(), App(), DAYS_OF_WEEK, HOURS, formatDate(), formatHourRange(), formatTimeSlot() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (19): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/react, @types/react-dom (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (11): Backend, Data, Features, Firebase, Frontend, Getting Started, Prerequisites, Run locally (development) (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **78 isolated node(s):** `fs`, `cors`, `path`, `http`, `fsp` (+73 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 3` to `Community 5`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `fs`, `cors`, `path` to the rest of the system?**
  _78 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09401709401709402 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._