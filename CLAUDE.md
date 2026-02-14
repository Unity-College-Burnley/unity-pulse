# Unity Pulse — Project Guide

## What Is This?

Unity Pulse is a school management platform for Unity College. It provides role-based dashboards for parents, teachers, and senior leadership (admin), with attendance tracking, behaviour logging, timetables, messaging, and announcements. The backend uses mock data designed to mirror the Wonde API shape for easy future integration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript 5.3, Vite 5, Tailwind CSS 3.4, React Router 6.21, Lucide icons |
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
│   │   │   ├── NewsFeed.tsx
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
│   │   │   ├── StaffDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── Register.tsx        # Attendance + ATL marking (most complex page)
│   │   │   ├── Messages.tsx
│   │   │   ├── StudentProfile.tsx  # Individual student view (staff/admin)
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
│   │   └── 404.html                # GitHub Pages SPA redirect hack
│   ├── tailwind.config.js          # Brand purple (#6D2077), custom slide animations
│   └── vite.config.ts              # Dev proxy + GitHub Pages base path
│
├── server/                         # Express backend (port 4000)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts             # POST /api/auth/login
│   │   │   ├── students.ts         # Student profile, attendance, behaviour, timetable, search, classes, contacts
│   │   │   ├── register.ts         # Lesson registers (GET/POST attendance + ATL + notes)
│   │   │   ├── staff.ts            # Teacher classes, timetable, manual behaviour logging
│   │   │   ├── admin.ts            # School-wide stats, announcement CRUD
│   │   │   ├── announcements.ts    # GET /api/announcements
│   │   │   └── messages.ts         # 1-to-1 messaging (contacts, threads, send)
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

All mock users share the password `password123`.

## Key Architecture Decisions

- **BrowserRouter** (not data router) — `useBlocker` is NOT available. Navigation guards use a custom `NavigationGuardContext` instead.
- **Mock-first** — all data lives in `server/src/data/mockData.ts`. The `wondeService.ts` layer is designed so real Wonde API calls can replace mock functions without changing routes.
- **API envelope** — all responses use `{ data: T }` shape to match Wonde's format.
- **In-memory register store** — `registerStore` is a `Map<string, RegisterEntry[]>` keyed by `${lessonId}_${date}`. Data resets on server restart (or page refresh in static mode).
- **Role-based routing** — single `/dashboard` route renders `ParentDashboard`, `StaffDashboard`, or `AdminDashboard` based on `user.role`.
- **Dual-mode API client** — `api.ts` checks `VITE_USE_MOCK` at build time. In dev mode it makes real fetch calls to the Express backend. In static mode it routes through `mock/handlers.ts`.

## Student Profiles

Staff and admins can view individual student profiles at `/student/:studentId`. Profiles show attendance, behaviour, timetable, class groups, and parent contacts, plus an inline behaviour logger.

- **StudentSearch** (`/student-search?q=...`) — search by name, click result to view profile
- **StudentProfile** (`/student/:studentId`) — parallel data fetching, reuses AttendanceSummary/Timetable/BehaviourLog components
- Student names are clickable links in the Register page and AdminDashboard below-threshold list
- StaffDashboard search bar navigates to `/student-search`

## Register Page (Most Complex Feature)

The register page (`client/src/pages/Register.tsx`) handles attendance marking, ATL grading, and post-lesson behaviour logging for a single lesson instance.

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

## Patterns & Conventions

- **Tailwind only** — no CSS modules or styled-components. Brand colour: `brand-500` = `#6D2077`.
- **Lucide icons** — import individually from `lucide-react`.
- **API calls** — use the `api` singleton from `client/src/services/api.ts`. It auto-attaches the JWT and uses the Vite proxy (or mock handlers in static mode).
- **Types** — keep `server/src/types/index.ts` and `client/src/types/index.ts` in sync manually. Server types are canonical.
- **State** — local `useState` per component, no Redux. Global state only for auth and navigation guard via Context.
- **Mobile-first** — responsive breakpoints via Tailwind (`md:`, `sm:`). Desktop tables become card lists on mobile.

## What's NOT Yet Built

- Real Wonde API integration (mock data only)
- Student photo display (field exists, no images)
- Register tabs beyond "Register" (Photos, Seating Plan, Files, Spreadsheet, Comms, Pastoral, Attendance, Assessment, MyPlans — all show "coming soon")
- Push notifications
- File uploads
- Database persistence (everything is in-memory, resets on server restart)
