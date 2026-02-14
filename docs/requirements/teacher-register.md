# Teacher Register — Requirements

## Overview

The register is the core of the teacher workflow. It opens when a teacher clicks a lesson from the timetable. It handles attendance, ATL grading, and has tabs for other class-level functions.

## Opening the Register

- Clicked from the weekly timetable (own or another teacher's)
- Can access current week and navigate to previous/future weeks
- Any teacher can open and take any other teacher's register

## Main Register View

A table with one row per student, showing:

- **Student name**
- **Form group**
- **Attendance code** for this lesson (editable)
- **ATL grade** for this lesson (editable)
- **Codes from other lessons today** (read-only, for context — including codes entered by attendance staff such as $, 0, &, etc.)
- **Reward points received today** (running total)
- **Consequences received today** (running total)

### Attendance Marking

- **All students default to NOT present** — a teacher must actively mark each student present
- Present codes: `/` (AM) or `\` (PM)
- If a student is absent or has another circumstance, select from the code list
- Should be fast — ideally one tap/click per student to mark present, with the option to "mark all present" if the teacher prefers (but the default is unmarked)

### ATL (Attitude to Learning) Grading

- Every student must receive an ATL grade every lesson (school policy)
- Grades:
  - **1** — Outstanding
  - **2** — Expected
  - **3** — Inconsistent
  - **4** — Sanctioned
  - **5** — Removed
- ATL can be entered during or at the end of the lesson
- ATL is a separate field from attendance — never overwrites or shares a field

### Post-ATL Logging (Automatic Prompt)

When the teacher saves/submits the register, if **any student has an ATL other than 2**, a follow-up screen appears automatically showing only those students. For each:

- **ATL 1 (Outstanding):** Teacher selects a reward reason from a dropdown and optionally adds a note. A merit/reward point is logged.
- **ATL 3 (Inconsistent):** Teacher selects a demerit/consequence reason from a dropdown and optionally adds a note. A demerit is logged.
- **ATL 4 (Sanctioned):** Teacher selects from a more serious tier of consequence options. Details to be specified in the behaviour/consequences system.
- **ATL 5 (Removed):** Teacher selects from the most serious tier of consequence options. Details to be specified in the behaviour/consequences system.

This screen should be quick — dropdowns pre-populated, minimal typing required. The goal is to capture the "why" without adding friction.

Consequence tiers and specific options for ATL 3/4/5 to be designed as part of the behaviour module requirements.

## Full Attendance Code Reference

| Code | Description |
|------|-------------|
| / | Present (AM) |
| \ | Present (PM) |
| N | No reason yet provided for absence |
| - | All should attend / No mark recorded |
| 1 | ATL — Outstanding |
| 2 | ATL — Expected |
| 3 | ATL — Inconsistent |
| 4 | ATL — Sanctioned |
| 5 | ATL — Removed |
| 6 | Internal truancy |
| $ | First Aid |
| 0 | Reflection |
| Q | Unable to attend — lack of access arrangement |
| A | Reflection |
| C1 | Leave of absence — regulated performance or employment abroad |
| C2 | Leave of absence — part-time timetable |
| J1 | Leave of absence — interview for employment or transfer |
| K | Attending alternative provision arranged by the LA |
| Y1 | Unable to attend — normal transport not available |
| Y2 | Unable to attend — widespread travel disruption |
| Y3 | Unable to attend — unavoidable partial closure |
| Y4 | Unable to attend — unavoidable full closure |
| Y5 | Unable to attend — criminal justice detention |
| Y6 | Unable to attend — public health guidance/law |
| Y7 | Unable to attend — unavoidable other than Y1–Y6 |
| !Q | Interventions |
| L | Late (before registers closed) |
| M | Medical/dental appointment |
| I | Illness |
| ! | Not required to attend — non-compulsory school age pupil |
| 7 | Illness due to Covid-19 |
| 8 | Self-isolating due to Covid-19 |
| 9 | Shielding due to Covid-19 |
| F | Extended family holiday (agreed) |
| # | Planned whole school closure |
| Z | DfES Z: Pupil not on roll |
| @ | Do not use |
| X | Not required to attend — non-compulsory school age pupil |
| & | In school not in class |
| O | Absent in other or unknown circumstances |
| P | Participating in a sporting activity |
| R | Religious observance |
| S | Study leave for public examination |
| T | Travelling with parent for occupational purposes |
| U | Late (after registers closed) |
| V | Attending an educational visit or trip |
| W | Attending work experience |
| B | Attending any other approved educational activity |
| C | Other authorised exceptional circumstances |
| D | Dual registration |
| E | Suspended or excluded without alternative provision |
| G | Family holiday (not agreed) |
| H | Family holiday (agreed) |
| Y | Unable to attend due to exceptional circumstances |
| J | Interview |

**Note:** Most of these codes are entered by attendance staff, not class teachers. Teachers primarily use `/`, `\`, `N`, and `L` day-to-day. All codes should be **readable** on the register for context, but many will be read-only for class teachers.

## Register Tabs

### Photos
- Grid of student photos for the class
- Helps teachers learn names, especially for new classes or cover lessons

### Seating Plans
- **Classroom template system:** Teachers create a drag-and-drop room layout (desk positions, groups, rows, etc.) and save it as a named template
- Templates are **shared** — any teacher can search for and use a template for a room (e.g. "Room M04 — Groups" or "Sports Hall")
- Each template is per-room, and different rooms have different templates
- Once a template is selected, students from the register are **dragged and dropped** into positions and saved
- A teacher who only uses a room a few times a week can find the existing template rather than creating their own

### Files and Classwork
- A file storage/sharing area linked to this class
- Details to be specified

### Spreadsheet
- Spreadsheet tool linked to the class
- Can **auto-populate student names** from the register
- Details to be specified

### Communications
- Class-level communications
- Details to be specified

### Pastoral Log
- Pastoral notes and records for students in this class
- Details to be specified

### Attendance
- Detailed attendance view for this class
- Details to be specified

### Assessment
- Assessment records for this class
- Details to be specified

### MyPlans
- Shows a list of students in the class who have MyPlans (SEN/support plans)
- Each entry links through to the student's profile and the MyPlan section
- Helps teachers quickly check support requirements before/during a lesson
