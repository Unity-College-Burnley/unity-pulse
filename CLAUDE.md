# Unity Pulse — Project Guide

## What Is This?

Unity Pulse is a school management platform for Unity College. It provides role-based dashboards for parents, teachers, students, and senior leadership (admin), with attendance tracking, behaviour logging, timetables, messaging, homework, SEND plans, and announcements. The backend uses mock data designed to mirror the Wonde API shape for easy future integration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript 5.3, Vite 5, Tailwind CSS 3.4, React Router 6.21, Lucide icons, Google Fonts (Inter + Quantico) |
| Backend | Express 4.18, TypeScript 5.3, JWT (jsonwebtoken), bcryptjs |
| Dev tooling | tsx (watch mode), concurrently (runs client + server), Vite proxy to backend |
| Hosting | GitHub Pages (static build with bundled mock data) |

## Project Structure

```
Unity Pulse/
├── .github/workflows/
│   └── deploy.yml                  # GitHub Actions — builds + deploys to Pages on push to main
│
├── client/                         # React frontend (port 3000)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx          # App shell — Navigation + <Outlet>
│   │   │   ├── Navigation.tsx      # Top nav bar (guarded navigation)
│   │   │   ├── AttendanceSummary.tsx
│   │   │   ├── BehaviourLog.tsx
│   │   │   ├── BehaviourLogger.tsx
│   │   │   ├── ClassAttendance.tsx
│   │   │   ├── ClassAttendanceTab.tsx # School vs class attendance comparison
│   │   │   ├── ClassNotices.tsx    # Teacher class posts (visible on student/parent dashboards)
│   │   │   ├── CommsTab.tsx        # Class posts with replies (register tab)
│   │   │   ├── DueDatePicker.tsx   # Custom calendar date picker
│   │   │   ├── HomeworkList.tsx    # Read-only homework widget (student/parent)
│   │   │   ├── HomeworkTab.tsx     # Homework management (register tab)
│   │   │   ├── MyPlansTab.tsx      # SEND plans — pen portraits, MyPlans, EHCPs
│   │   │   ├── NewsFeed.tsx
│   │   │   ├── PhotoGrid.tsx       # Student photo grid (register tab)
│   │   │   ├── PulseLogo.tsx       # Wordmark logo — heartbeat SVG + "Unity Pulse" in Quantico font
│   │   │   ├── SeatingPlan.tsx     # Drag-and-drop seating plan (register tab)
│   │   │   ├── SpreadsheetTab.tsx  # Editable data grid with arrow key nav
│   │   │   ├── Timetable.tsx
│   │   │   └── TodaysClasses.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx      # JWT auth state (login, logout, user)
│   │   │   └── NavigationGuardContext.tsx  # Blocks nav when register has unsaved ATLs
│   │   ├── mock/                   # Static-mode API layer (GitHub Pages)
│   │   │   ├── data.ts             # Duplicate of server mock data, bundled into client
│   │   │   └── handlers.ts         # Client-side route handlers that mirror Express routes
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── ParentDashboard.tsx
│   │   │   ├── StudentDashboard.tsx # Student role dashboard
│   │   │   ├── StaffDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── Register.tsx        # Attendance + ATL marking + tabbed class tools
│   │   │   ├── Messages.tsx        # 1-to-1 messaging with allowReplies toggle
│   │   │   ├── StudentProfile.tsx  # Tabbed: Overview, Behaviour, Pastoral
│   │   │   └── StudentSearch.tsx   # Search students by name (staff/admin)
│   │   ├── services/
│   │   │   └── api.ts              # Fetch wrapper — uses real API or mock handlers
│   │   ├── types/
│   │   │   └── index.ts            # Frontend type definitions (mirrors server types)
│   │   ├── App.tsx                 # BrowserRouter + route definitions
│   │   ├── main.tsx                # React root
│   │   ├── vite-env.d.ts           # Vite type declarations (import.meta.env)
│   │   └── index.css               # Tailwind directives + global styles
│   ├── public/
│   │   ├── 404.html                # GitHub Pages SPA redirect hack
│   │   ├── favicon.svg             # Browser tab icon — shield with pulse line
│   │   └── logo.svg                # Standalone shield logo (used as fallback)
│   ├── tailwind.config.js          # Brand purple (#6D2077), custom slide animations
│   └── vite.config.ts              # Dev proxy + GitHub Pages base path
│
├── server/                         # Express backend (port 4000)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts             # POST /api/auth/login
│   │   │   ├── students.ts         # Student profile, attendance, behaviour, timetable, search, classes, contacts
│   │   │   ├── register.ts         # Lesson registers + class attendance endpoint
│   │   │   ├── staff.ts            # Teacher classes, timetable, manual behaviour logging
│   │   │   ├── admin.ts            # School-wide stats, announcement CRUD
│   │   │   ├── announcements.ts    # GET /api/announcements
│   │   │   ├── messages.ts         # 1-to-1 messaging (contacts, threads, send)
│   │   │   ├── homework.ts         # Homework CRUD + completion tracking
│   │   │   ├── classPosts.ts       # Class posts (one-way teacher notices)
│   │   │   ├── pastoral.ts         # Pastoral notes CRUD
│   │   │   └── send.ts             # SEND plans (read-only for teachers)
│   │   ├── middleware/
│   │   │   └── auth.ts             # requireAuth, requireRole, signToken
│   │   ├── data/
│   │   │   ├── mockData.ts         # All seed data (users, students, lessons, etc.)
│   │   │   └── wondeService.ts     # Service layer — wraps mock data, swap for real Wonde calls
│   │   ├── services/
│   │   │   └── wondeService.ts     # Service layer — wraps mock data
│   │   └── types/
│   │       └── index.ts            # Canonical type definitions
│   └── index.ts                    # Express app setup, route mounting, CORS
│
├── package.json                    # Root — `npm run dev` runs both client + server
└── unity-pulse-kickoff-prompt.md   # Original project requirements
```

## Running the App

```bash
# From project root — starts both client and server
npm run dev
```

- Client: http://localhost:3000
- Server: http://localhost:4000
- Vite proxies `/api/*` → server automatically

## GitHub Pages (Static Demo)

The app is deployed to **https://unity-college-burnley.github.io/unity-pulse/** via GitHub Actions.

### How it works

GitHub Pages only serves static files — no Express server. To make the full app work without a backend:

1. **Mock data is bundled into the client** (`client/src/mock/data.ts`) — this is a duplicate of `server/src/data/mockData.ts`. Both copies must be kept in sync when mock data changes.
2. **Mock route handlers** (`client/src/mock/handlers.ts`) replicate all Express route logic client-side. When `VITE_USE_MOCK=true`, the `api.ts` client intercepts all requests and routes them through these handlers instead of making real HTTP calls.
3. **SPA routing** uses a `404.html` redirect hack (since GitHub Pages doesn't support client-side routing natively). The 404.html encodes the path as a query parameter, and a script in `index.html` restores it.
4. **Base path** is set to `/unity-pulse/` via `GITHUB_PAGES=true` env var in the Vite build.

### Keeping mock data in sync

**When you change `server/src/data/mockData.ts`, you MUST also update `client/src/mock/data.ts`** to match. Similarly, if you add or change an API endpoint in the server routes, you must update `client/src/mock/handlers.ts`.

The server mock data is the source of truth. The client copies exist solely for the static GitHub Pages build.

### Build commands

```bash
# Local dev (real backend) — no mock needed
npm run dev

# GitHub Pages build (static, mock API)
cd client && VITE_USE_MOCK=true GITHUB_PAGES=true npm run build
```

The GitHub Actions workflow (`.github/workflows/deploy.yml`) runs the static build automatically on every push to `main`.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Parent | sarah.thompson@example.com | password123 |
| Teacher | j.wilson@unitycollege.ac.uk | password123 |
| Admin | admin@unitycollege.ac.uk | password123 |
| Student | oliver.thompson@unitycollege.ac.uk | password123 |

All mock users share the password `password123`.

## Key Architecture Decisions

- **BrowserRouter** (not data router) — `useBlocker` is NOT available. Navigation guards use a custom `NavigationGuardContext` instead.
- **Mock-first** — all data lives in `server/src/data/mockData.ts`. The `wondeService.ts` layer is designed so real Wonde API calls can replace mock functions without changing routes.
- **API envelope** — all responses use `{ data: T }` shape to match Wonde's format.
- **In-memory register store** — `registerStore` is a `Map<string, RegisterEntry[]>` keyed by `${lessonId}_${date}`. Data resets on server restart (or page refresh in static mode). Historical register data is pre-seeded in `initRegisters()` so the class attendance tab has realistic data.
- **Role-based routing** — single `/dashboard` route renders `ParentDashboard`, `StaffDashboard`, `StudentDashboard`, or `AdminDashboard` based on `user.role`.
- **Dual-mode API client** — `api.ts` checks `VITE_USE_MOCK` at build time. In dev mode it makes real fetch calls to the Express backend. In static mode it routes through `mock/handlers.ts`.

## Roles

| Role | Dashboard | Can Access |
|------|-----------|------------|
| Parent | ParentDashboard | Own children's data, messages, announcements, class notices |
| Student | StudentDashboard | Own data, homework, timetable, announcements, class notices |
| Teacher | StaffDashboard | Register, student search/profiles, messages, class management |
| Admin | AdminDashboard | Everything teachers can + school-wide stats, announcements CRUD |

Student users have `role: 'student'` and `studentIds: [their_own_id]` — reuses the parent ownership pattern for data access control.

## Student Profiles

Staff and admins can view individual student profiles at `/student/:studentId`. The profile is organised into three tabs:

- **Overview**: Class groups, parent contacts, attendance summary, timetable
- **Behaviour**: Behaviour log + inline behaviour logger for recording events
- **Pastoral**: Pastoral notes with create/delete, severity-coded (low/medium/high), category-tagged (safeguarding, welfare, attendance, behavioural, family, medical, other)

Student names are clickable links throughout the app (Register page, AdminDashboard, attendance tab, etc.).

## Register Page (Most Complex Feature)

The register page (`client/src/pages/Register.tsx`) handles attendance marking, ATL grading, and post-lesson behaviour logging for a single lesson instance.

### Register Tabs

The register page has 9 tabs. The first 5 are shown inline, the rest are in a "More" dropdown. All tabs are evenly spaced (`flex-1`) across the viewport width.

| Tab | Component | Description |
|-----|-----------|-------------|
| Register | (inline) | Attendance + ATL marking, action items sidebar |
| Homework | HomeworkTab | Set homework, track completions, manage due dates |
| Photos | PhotoGrid | Student photo grid with toggle for photo/no-photo view |
| Seating Plan | SeatingPlan | Drag-and-drop classroom layout |
| Files | — | Coming soon (needs backend file storage) |
| Spreadsheet | SpreadsheetTab | Editable data grid with arrow key navigation |
| Comms | CommsTab | Class posts with optional replies (allowReplies toggle) |
| Attendance | ClassAttendanceTab | School vs class attendance side by side |
| MyPlans | MyPlansTab | SEND plans — pen portraits, MyPlans, EHCPs |

### Data Model

```typescript
RegisterEntry {
  studentId: string;
  attendanceCode: string;   // '-' | '/' | '\\' | 'L' | 'N'
  atlGrade: ATLGrade | null; // 1=Outstanding, 2=Expected, 3=Inconsistent, 4=Sanctioned, 5=Removed
  note?: string;             // e.g. "5 minutes late"
}
```

### Action Items Sidebar

The sidebar prompts teachers to resolve incomplete attendance marks:

- **L code + no note** → "Late — no minutes" card with number input. Saving sets `localNote` to e.g. "5 minutes late".
- **N code** → "Confirm attendance" card with three buttons:
  - "Arrived Late" → changes code to L (triggers late-no-minutes item)
  - "Mark Present" → changes code to `/` or `\` based on period
  - "Confirm Absent" → dismisses the item, keeps N

Action items are computed via `useMemo` from the rows array. The sidebar auto-opens when items first appear.

- **Desktop**: fixed right panel (w-80) with slide-in animation
- **Mobile**: bottom sheet with rounded top corners and drag handle

### Save Flow

1. Teacher clicks "Save Register"
2. If unresolved action items exist → confirmation dialog ("You have X unresolved items. Save anyway?")
   - "Review Items" → opens sidebar
   - "Save Anyway" → proceeds with save
3. Save sends entries (including notes) to `POST /api/register/:lessonId/:date`
4. Server returns students needing post-ATL logging (ATL ≠ 2)
5. Post-ATL modal appears with category dropdown + optional note per student
6. Teacher clicks "Log All" to save behaviour events

### Navigation Guard (ATL Incomplete Warning)

When not all students have an ATL grade, navigating away triggers a warning:

- **Back arrow button**: shows in-page "ATLs Are Incomplete — Stay / Leave Anyway" modal
- **Nav bar links** (Dashboard, Messages, logo): `NavigationGuardContext` intercepts and shows warning modal in Navigation component
- **Browser tab close / refresh**: native `beforeunload` prompt

The guard is registered via `useEffect` in Register.tsx and automatically clears when ATLs are complete or the component unmounts.

**Important**: The app uses `<BrowserRouter>`, so React Router's `useBlocker` does NOT work. The guard is implemented manually via context + state.

### Attendance Codes

| Code | Meaning | Present? |
|------|---------|----------|
| `-` | No mark | — |
| `/` | Present (AM, periods 1–3) | Yes |
| `\` | Present (PM, periods 4–5) | Yes |
| `L` | Late (before close of register) | No |
| `N` | No reason yet provided | No |

### ATL Grades

| Grade | Label | Behaviour |
|-------|-------|-----------|
| 1 | Outstanding | Triggers reward logging |
| 2 | Expected | No logging needed |
| 3 | Inconsistent | Triggers consequence logging |
| 4 | Sanctioned | Triggers consequence logging |
| 5 | Removed | Triggers consequence logging |

## Class Attendance Tab

Shows school-wide and class-specific attendance side by side per student. Key features:

- **Summary cards**: School average, class average, count below 90%, student count
- **Dual percentage columns**: School % and This Class % with colour-coded badges
- **Warning triangle**: Flags students where school % is 5%+ above class % (attending school but skipping this class)
- **Lates proportion**: Shows "X of Y" (class lates / school lates) with a clock icon when >30% of school lates are in this class (and class lates >= 2), highlighting lesson-specific punctuality issues
- **Historical data**: Pre-seeded register entries for cls-1 (10 lessons) and cls-2 (8 lessons) in `initRegisters()`
- **Route ordering**: The `/class-attendance/:classGroupId` endpoint MUST be defined before `/:lessonId/:date` in Express to avoid parameter collision

## SEND / MyPlans Tab

Read-only reference sheet for teachers showing student SEND information. Data is managed by the SENCO, not classroom teachers.

### Plan Types

| Type | Badge Colour | Display | Description |
|------|-------------|---------|-------------|
| EHCP | Red | Collapsible | Legally binding document — provisions, adjustments, key worker, annual review date |
| MyPlan | Blue | Collapsible | School support plan — targets with progress tracking, strategies, review date |
| Pen Portrait | Purple | Expanded by default | Quick-read summary — strengths, difficulties, key strategies |

Students are sorted EHCP first (most critical), then MyPlan, then pen portrait only. Pen portraits are always visible since they're specifically designed as quick-reference for teachers.

### Data Model

```typescript
StudentPlan {
  studentId: string;
  penPortrait?: { summary, strengths[], difficulties[], strategies[], updatedAt };
  myPlan?: { targets[{ target, strategies[], progress }], reviewDate, keyWorker, updatedAt };
  ehcp?: { provisions[], adjustments[], keyWorker, annualReviewDate, updatedAt };
}
```

## Homework System

Teachers set homework from the Homework tab in the Register page. Students and parents see homework on their dashboards.

- **HomeworkTab**: Create homework (title, description, due date, links), view completion grid, toggle student completion
- **HomeworkList**: Read-only widget on student/parent dashboards showing due dates (colour-coded) and completion status
- **DueDatePicker**: Custom calendar component for selecting due dates
- No file uploads yet — teachers paste links or type descriptions instead

## Messaging

1-to-1 messaging between users with an `allowReplies` toggle:

- **Staff** see a toggle above the compose area to enable/disable replies
- **Non-staff** see "Replies are not enabled" with a lock icon when replies are disabled
- **StaffDashboard** shows an unread message count badge on the message icon (polls every 30 seconds)

## Class Posts (Comms Tab)

One-way teacher notices visible to students and parents on their dashboards via the ClassNotices component. Posts can optionally allow replies from the CommsTab in the register.

## Pastoral System

Pastoral notes are recorded on the StudentProfile page (Pastoral tab), not from the register class view. Features:

- **Categories**: safeguarding, welfare, attendance, behavioural, family, medical, other
- **Severity levels**: low (green), medium (amber), high (red)
- **Create/delete**: Teachers can add notes and delete their own; admins can delete any
- **Count badge**: Pastoral tab shows a count badge when notes exist

## Branding & Logo

- **PulseLogo component** (`client/src/components/PulseLogo.tsx`) — the primary wordmark used on the login page and navigation bar
- **Design**: A single continuous SVG line starts with ECG heartbeat peaks (spike up + dip below the baseline) to the LEFT of the text, then flattens into a traditional underline beneath "Unity Pulse"
- **Font**: Quantico (Google Fonts) — a structured sans-serif with a slightly techy feel, used only for the logo wordmark. The rest of the app uses Inter.
- **Two sizes**: `size="lg"` for the login page, `size="sm"` for the nav bar. Uses `preserveAspectRatio="none"` with `vectorEffect="non-scaling-stroke"` so the flat underline stretches to fit while the stroke stays consistent.
- **Favicon**: `client/public/favicon.svg` — purple shield with pulse line for the browser tab
- **Colour**: Brand purple `#6D2077` (`brand-500` in Tailwind config). The logo inherits `currentColor` so it adapts to white text on the nav bar and login page.

## Patterns & Conventions

- **Tailwind only** — no CSS modules or styled-components. Brand colour: `brand-500` = `#6D2077`.
- **Lucide icons** — import individually from `lucide-react`.
- **API calls** — use the `api` singleton from `client/src/services/api.ts`. It auto-attaches the JWT and uses the Vite proxy (or mock handlers in static mode).
- **Types** — keep `server/src/types/index.ts` and `client/src/types/index.ts` in sync manually. Server types are canonical.
- **State** — local `useState` per component, no Redux. Global state only for auth and navigation guard via Context.
- **Mobile-first** — responsive breakpoints via Tailwind (`md:`, `sm:`). Desktop tables become card lists on mobile.
- **Tab overflow pattern** — when there are too many tabs, first 5 show inline, the rest go in a "More" dropdown. All tabs are `flex-1 text-center` for even spacing.
- **Express route ordering** — specific path routes (e.g. `/class-attendance/:id`) MUST be defined before wildcard parameter routes (e.g. `/:lessonId/:date`) to avoid parameter collision.

## What's NOT Yet Built

- Real Wonde API integration (mock data only)
- Student photo display (field exists, no images)
- Files tab in register (needs backend file storage)
- Push notifications
- File uploads
- Database persistence (everything is in-memory, resets on server restart)
- Deeper attendance analytics (Synergy's "Attend" module equivalent)
