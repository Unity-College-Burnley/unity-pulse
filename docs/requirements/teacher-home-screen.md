# Teacher Home Screen — Requirements

## Overview

The teacher home screen is the main landing page after login. It provides a weekly timetable view, quick access to registers, messages, alerts, and navigation to other modules. Everything should be designed to minimise clicks and friction.

## Weekly Timetable (Main View)

- Displays the full Mon–Fri timetable grid for the current week
- The school operates a **two-week timetable (Week A / Week B)** — show one week at a time with a clear toggle to switch between them
- Each lesson in the grid is **clickable** and opens the register for that lesson
- Navigation arrows to move forward/back through weeks to access previous and future registers
- Current day/period should be visually highlighted so the teacher can immediately see where they are in the day
- Form time (08:30–08:50), break (10:50–11:10), and lunch (13:10–13:50) should be visible in the grid for context

### Other Teachers' Timetables

- A **dropdown selector** allows the teacher to view any other teacher's timetable
- From that view, they can access and take registers for that teacher's lessons
- Primary use cases: checking where a student is, covering another teacher's lesson

## Tabs / Panels

### Parent Messages Tab

- A tab on the home screen that shows the teacher's message inbox
- Allows quick reading and replying without navigating away from the home screen
- Unread message count shown on the tab badge

### Pastoral/Safeguarding Alerts Tab

- **Not displayed openly on the home screen** for privacy — a student could see over a teacher's shoulder, or the screen could be projected
- Shows only a **notification badge with unread count** (e.g. "3") on the tab
- Clicking the tab navigates to a **separate, private screen** (not a panel on the home screen)
- The alerts screen works like the messages inbox:
  - List of alerts, most recent first
  - Click an alert to read the full detail
  - Threaded replies visible to all recipients
- Alerts are created by any staff member about a specific student
- Targeted to specific groups/roles:
  - All teachers who teach that student
  - Form tutor only
  - SLT
  - Safeguarding team
  - Head of year / Deputy head of year
  - Any combination of the above
- Two types:
  - **FYI** — information only, no response needed
  - **Action required** — requests a comment or reply from recipients
- Alerts **never expire** — they persist indefinitely
- **Periodic reminders** for unread or unactioned alerts
- Confidentiality levels (pastoral vs safeguarding) to be designed in detail later

## Student Search

- A **search bar** accessible from the home screen
- Search by student name to find any student's profile
- Student profile page to be specified separately

## Sidebar / Navigation

- Persistent sidebar or tab navigation to access other modules:
  - **Behaviour** (to be specified)
  - **Attendance** (to be specified)
  - Additional modules may be added later

## School Day Reference

| Time          | Session   |
|---------------|-----------|
| 08:30 – 08:50 | Form      |
| 08:50 – 09:50 | Period 1  |
| 09:50 – 10:50 | Period 2  |
| 10:50 – 11:10 | Break     |
| 11:10 – 12:10 | Period 3  |
| 12:10 – 13:10 | Period 4  |
| 13:10 – 13:50 | Lunch     |
| 13:50 – 14:50 | Period 5  |
