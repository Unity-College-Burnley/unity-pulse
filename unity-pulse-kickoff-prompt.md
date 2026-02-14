# Unity Pulse — Claude Code Kickoff Prompt

Copy and paste everything below the line into Claude Code to kick off the project.

---

## Prompt

I want to build a web application called **Unity Pulse** — a lightweight, modern school portal that replaces School Synergy at Unity College (a secondary school with ~1,400 students and ~200 staff in the northwest of England).

### What Unity Pulse is

Unity Pulse is a lean, clean frontend that sits on top of **SIMS** (our school Management Information System). SIMS holds all the underlying data — Unity Pulse pulls it through and presents it in a simple, fast, user-friendly interface. Think of it as a better dashboard layer, not a replacement for SIMS itself.

We plan to use the **Wonde API** (https://docs.wonde.com) as the middleware to access SIMS data. Wonde provides REST endpoints for student records, attendance, behaviour, timetables, contacts, and more. For now, stub out the Wonde integration with mock data so we can build and test the UI without needing a live SIMS connection, but structure the code so swapping in real Wonde API calls later is straightforward.

### Core features (in priority order)

1. **Parent portal** — parents log in and see a clean dashboard for their child(ren) showing:
   - Attendance summary (today + trends)
   - Behaviour log (positive and negative events, recent first)
   - Timetable (today's view + weekly view)
   - School news/announcements feed

2. **1-to-1 messaging** — parents and staff can message each other within the app (like a simple inbox). Messages are stored in Unity Pulse's own database (not SIMS). Keep it simple — no group chats, no media attachments for now, just text messages with read receipts.

3. **Staff dashboard** — teachers/staff log in and see:
   - Their classes for today
   - Quick behaviour logging (select student, category, points, note — submit)
   - Attendance overview for their classes
   - Access to the messaging inbox

4. **Admin dashboard** — senior leadership get:
   - Whole-school attendance overview
   - Behaviour trends and summaries
   - Announcement/news management (create, edit, publish)

### Design principles

- **Lean and fast.** This exists because School Synergy has too much clutter. Every screen should be focused and uncluttered. If a feature isn't in the list above, don't build it.
- **Mobile-first.** Most parents will use this on their phones. It must work beautifully on mobile.
- **Accessible.** Must meet WCAG 2.1 AA. This is a school — inclusivity matters.
- **Clean, modern UI.** Calming colour palette. The school brand colour is up to me to decide later, so for now use a deep teal (#0D7377) as the primary brand colour with a clean white/light grey background.

### Tech stack preferences

- **Frontend:** React with TypeScript, Tailwind CSS
- **Backend:** Node.js with Express (or similar lightweight framework)
- **Database:** PostgreSQL for messaging and any data Unity Pulse owns (not pulled from SIMS)
- **Authentication:** Role-based auth (parent, teacher, admin roles). For now, build a simple email/password auth system. We may move to SSO or integration with the school's Microsoft 365 later.

### What to build first

Start by scaffolding the full project structure, then build out a working **parent portal prototype** with:
- Login page
- Parent dashboard with mock data for one student (attendance, behaviour, timetable, news)
- Clean, mobile-responsive layout
- Mock data service that mirrors the shape of Wonde API responses so we can swap in real data later

### Important context

- This is a UK secondary school. Use UK English throughout (behaviour not behavior, colour not color, etc.). Date format dd/mm/yyyy. School day runs 08:30–15:10 with 5 one-hour periods.
- Student data is sensitive. Even though this is a prototype, structure the code with security in mind — no student data in URLs, proper auth checks on every route, input sanitisation.
- I'm a school staff member, not a full-time developer, so the codebase should be clean, well-commented, and easy for me to maintain and extend.

Please start by scaffolding the project and building the parent portal prototype.
