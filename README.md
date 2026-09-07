# Faculty Performance Appraisal System (React + Node/Express + SQLite)

A React (Vite) frontend backed by a real Node/Express + SQLite API server.

## What changed from the original

- **Single login page.** Username + password only — no role, department, or
  designation picker. The server authenticates the credentials and looks up
  the account's role (admin/faculty) and, for faculty, their department and
  designation from the database. The client never supplies any of that.
- **Real backend.** All data (faculty accounts, questions, submissions) now
  lives in a SQLite database (`server/data.sqlite`, created automatically on
  first run) instead of `localStorage`.
- **Weightage is never sent to faculty.** The `/api/questions` endpoint
  strips weightage and returns each rating option's score already
  multiplied by its weightage, so the faculty UI only ever shows a final
  "Score" — never a raw weightage value. Score is also always recomputed
  server-side on submit, so the client cannot manipulate it.
- **Hierarchical questions.** Each question carries a Section → Subsection →
  Group path (e.g. `A. Self Appraisal` → `A.1 Self Development` →
  `A1.1 Knowledge / Skill Development`), rendered as nested headings above
  the question list.
- **Faculty header.** Faculty land directly on their appraisal after login.
  The top bar shows "Faculty Performance Appraisal System" with **Change
  Password** and **Logout** on the right, and a strip below with User ID,
  Name, Department, and Designation pulled from the authenticated session.
- **Settings/Theme removed entirely**, along with the old role-based login.
- The Admin console (Question Builder, Submissions review) is unchanged in
  spirit but now reads/writes through the API instead of `localStorage`,
  and the Question Builder has three extra fields (Section / Subsection /
  Group) to define the hierarchy shown to faculty.

## Project structure

```
server/            Node/Express + SQLite API (new)
  db.js              schema + one-time seed data
  auth.js            simple token-based session store
  index.js            all API routes
  data.sqlite         created automatically on first run (git-ignored)
src/               React frontend (Vite)
  utils/api.js       fetch wrapper for the backend
  ...
```

## Run locally

You need **two terminals** — one for the API server, one for the frontend.

**Terminal 1 — API server**

```bash
cd server
npm install
npm start
```

This starts the API at `http://localhost:4000` and creates/seeds
`server/data.sqlite` on first run.

**Terminal 2 — frontend**

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

If your API server runs somewhere other than `http://localhost:4000`, set
`VITE_API_URL` (e.g. in a `.env` file at the project root) before running
the frontend.

## Sample accounts

| Username | Password    | Role    | Department  | Designation          |
|----------|-------------|---------|-------------|-----------------------|
| admin    | admin123    | Admin   | —           | —                      |
| CSET031  | faculty123  | Faculty | Engineering | Associate Professor   |
| CSET045  | faculty123  | Faculty | Engineering | AP2                    |
| CSET012  | faculty123  | Faculty | Engineering | Professor              |
| SNH021   | faculty123  | Faculty | S&H         | Professor              |
| SNH008   | faculty123  | Faculty | S&H         | AP1                    |
| SNH014   | faculty123  | Faculty | S&H         | APSG                   |

Log in with any of these — no department/designation selection is needed;
the app resolves it from the database automatically. Senior designations
(APSG, Associate Professor, Professor) get an extra "Leadership &
Mentorship" question the junior designations (AP1–AP3) don't, so you can
verify that different Department + Designation combinations really do
produce different question sets.

## Build for production

```bash
npm run build
npm run preview
```

(The API server is started separately the same way, via `npm start` in
`server/`.)
