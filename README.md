# CampusOS — Frontend

React frontend for the CampusOS campus club and event management platform.

## Running it

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

The app uses a sample dataset held in your browser, so you can use every screen
without a database or network connection. Changes persist in local storage and
can be reset from the account menu or profile page.

Demo accounts (password `campus123` for all of them):

| Email | Role |
| --- | --- |
| `riya.sharma@campus.edu` | Student |
| `arjun.mehta@campus.edu` | Club administrator |
| `neha.kulkarni@campus.edu` | Faculty coordinator |
| `admin@campus.edu` | System administrator |

The sign-in screen lists them; clicking one fills the form.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint over `src` and the config files |
| `npm test` | Node's test runner over the demo data layer |
| `npm run check` | lint → test → build |

## Layout

```
src/
├── components/
│   ├── ui/           Button, Field, Badge, Modal, Panel, States, Toolbar, Icon
│   ├── layout/       AppLayout (signed-in shell), AuthLayout, PageHeader, Brand
│   ├── navigation/   Sidebar, AccountMenu, navConfig
│   ├── routing/      Route guards
│   ├── clubs/        ClubCard, ClubSummary
│   ├── dashboard/    Metric
│   └── events/       EventRecord, DateChip, EventForm
├── pages/
│   ├── auth/         Login, Register
│   ├── student/      Dashboard, clubs, events, registrations,
│   │                 recommendations, participation
│   ├── clubadmin/    Dashboard, clubs, members, events, registrations+attendance
│   ├── faculty/      Dashboard, pending queue, approve/reject
│   ├── admin/        Dashboard, approved events, statistics, accounts
│   └── shared/       Notifications, Profile, 404, workspace fallback
├── services/
│   ├── mocks/        Local dataset and the operations over it
│   ├── errors.js     ApiError / NotImplementedError
│   └── index.js      The only module pages import data from
├── context/          Auth, DataSource, Notifications, Toast, PageMeta
├── hooks/            useAsync, useForm, useDebouncedValue, …
├── utils/            constants, format, status, validation, storage
└── styles/           tokens, base, components, layout
```

### How data flows

Pages call `clubService` / `eventService` / … from `services/index.js`. Those
services are the local mock implementations, backed by a browser-persisted store.
There are no HTTP requests or server credentials in the frontend.

### Conventions

- Every relative import carries its file extension. This is valid ESM, works
  unchanged under Vite, and lets `node --test` run the service layer directly.
- `useAsync` owns loading/error/empty; `AsyncSection` renders those three states
  so pages do not re-implement the branching.
- Status is never colour alone — `StatusBadge` pairs every colour with a glyph
  and a text label.
- Forms use `useForm` and `<Field>`; placeholder text is never the only label.

## Design

Warm neutral palette — paper, stone and ink — with a single brick accent used
sparingly for identity, the active nav marker and "published" state. Status
colours (green, amber, red) appear only on badges and alerts. Border radii are
small, elevation is reserved for things that actually float, and cards are used
only where each item is a thing you act on; dense lists use rows and tables.

## Authentication

Authentication is simulated locally. The seeded accounts and newly registered
accounts are stored in the browser, and a successful registration signs in
through the same local mock service.
