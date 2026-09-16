# CampusOS — Frontend

React frontend for the CampusOS campus club and event management platform.

## Running it

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

The app starts in **demo mode**: it reads a sample dataset held in your browser,
so you can use every screen without a database. A banner across the top says so,
and nothing is sent to the server while it is on.

Demo accounts (password `campus123` for all of them):

| Email | Role |
| --- | --- |
| `riya.sharma@campus.edu` | Student |
| `arjun.mehta@campus.edu` | Club administrator |
| `neha.kulkarni@campus.edu` | Faculty coordinator |
| `admin@campus.edu` | System administrator |

The sign-in screen lists them; clicking one fills the form.

### Running against the real backend

1. Start the Express API (`cd backend && npm install && node server.js`) with its
   `.env` and a reachable MySQL instance.
2. In CampusOS, open the account menu (bottom-left) → **Connect to live API**.
   Switching signs you out, because demo and live credentials are different.

`npm run dev` proxies `/api` to `http://localhost:5000`, so no CORS setup or
absolute URL is needed. To point somewhere else, copy `.env.example` to
`.env.local` and set `VITE_API_PROXY_TARGET`. **Never commit a `.env` file.**

Endpoints the backend has not built yet do not fall back to fake data in live
mode — the affected screen says exactly which endpoint it is waiting for. See
[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md).

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
│   └── events/       EventRecord, DateChip
├── pages/
│   ├── auth/         Login, Register
│   ├── student/      Dashboard, clubs, events, registrations
│   └── shared/       Notifications, Profile, 404, pending-workspace
├── services/
│   ├── api/          Live HTTP calls — one module per backend router
│   ├── mocks/        Demo dataset and the operations over it
│   ├── dataSource.js Live/demo switch + service factory
│   ├── errors.js     ApiError / NotImplementedError
│   └── index.js      The only module pages import data from
├── context/          Auth, DataSource, Notifications, Toast, PageMeta
├── hooks/            useAsync, useForm, useDebouncedValue, …
├── utils/            constants, format, status, validation, storage
└── styles/           tokens, base, components, layout
```

### How data flows

Pages call `clubService` / `eventService` / … from `services/index.js`. Each of
those is built by `createService({ live, demo })`, which picks the live or demo
implementation **at call time**. A method that exists in `demo` but not in `live`
is a feature the backend has not shipped: in live mode it rejects with
`NotImplementedError`, and `<AsyncSection>` renders a notice naming the missing
endpoint. No screen ever quietly shows demo data while claiming to be live.

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

The JWT is stored in `localStorage` and attached as `Authorization: Bearer …` by
`services/api/client.js`. A 401 from any request signs the user out once, through
a single subscription in `AuthContext`. Route guards are a UX affordance only —
the backend remains the authority on what each role may do.

Registration does not return a token (the backend's `/auth/register` returns the
user record), so a successful registration is followed by a real `/auth/login`
call with the same credentials.
