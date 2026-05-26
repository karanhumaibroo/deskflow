# DeskFlow — Support Ticket Triage Board

A full-stack MERN support ticket system with SLA tracking, status transitions, and a drag-and-drop board UI.

## Features

- **Kanban board** — Four columns: Open, In Progress, Resolved, Closed
- **SLA tracking** — Per-priority response targets (1h/4h/24h/72h), breached tickets flagged
- **Status transition rules** — Only adjacent moves allowed (forward/backward one step)
- **Drag & drop** — Cards are draggable between columns; invalid drops snap back with error
- **Filters** — By priority and SLA-breached status (combinable)
- **Stats strip** — Live ticket counts per status + breached count
- **Derived fields** — `ageMinutes` and `slaBreached` computed server-side on every read

## Project Structure

```
deskflow/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express app + MongoDB connection
│   │   ├── models/Ticket.js  # Mongoose model with virtuals
│   │   └── routes/tickets.js # All CRUD + stats endpoints
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── BoardColumn.jsx
    │   │   ├── CreateTicketModal.jsx
    │   │   ├── FiltersBar.jsx
    │   │   ├── StatsStrip.jsx
    │   │   └── TicketCard.jsx
    │   ├── hooks/useTickets.js
    │   ├── utils/api.js
    │   ├── utils/helpers.js
    │   ├── styles/global.css
    │   └── index.js
    ├── .env.example
    └── package.json
```

## Setup & Running Locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGO_URI from MongoDB Atlas
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000
npm start
```

## Deployment

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo, set root directory to `backend/`
3. Build command: `npm install`  
   Start command: `node src/index.js`
4. Add environment variables:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `FRONTEND_URL` — your Vercel/Netlify frontend URL
   - `PORT` — Render sets this automatically

### Frontend → Vercel

1. Import your GitHub repo on [Vercel](https://vercel.com)
2. Set root directory to `frontend/`
3. Add environment variable:
   - `REACT_APP_API_URL` — your Render backend URL (e.g. `https://deskflow-api.onrender.com`)

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/tickets` | Create a ticket |
| `GET` | `/tickets` | List tickets (`?status`, `?priority`, `?breached=true`) |
| `PATCH` | `/tickets/:id` | Update ticket status |
| `DELETE` | `/tickets/:id` | Delete a ticket |
| `GET` | `/tickets/stats` | Aggregate stats |

## SLA Targets

| Priority | Target |
|----------|--------|
| urgent | 1 hour |
| high | 4 hours |
| medium | 24 hours |
| low | 72 hours |

## Status Transitions

Forward: `open → in_progress → resolved → closed`  
Backward: one step only — `resolved → in_progress`, `in_progress → open`, `closed → resolved`
