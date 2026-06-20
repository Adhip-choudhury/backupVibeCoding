# Glamora — Salon & Parlour Management App

## Tech Stack
- **Vanilla HTML/CSS/JS** — No frameworks, pure SPA with custom hash-based routing
- **LocalStorage** — All data persisted in browser's localStorage (no backend)
- **CSS Variables** — Theming via CSS custom properties with a modern, elegant design
- **Chart.js** (optional) — For visual income/loss charts (loaded from CDN)

## Architecture

### SPA Router (`js/router.js`)
- Hash-based routing (`#dashboard`, `#customers`, `#billing`, `#payments`, `#reports`)
- Each route loads a view function that renders into `<main>`
- Route guard: redirect to `#dashboard` if hash is unknown

### Data Layer (`js/store.js`)
- Single `Store` object managing all localStorage reads/writes
- **Collections:**
  - `customers` — `{ id, name, phone, email, createdAt }`
  - `services` — `{ id, name, price, category }`
  - `transactions` — `{ id, customerId, serviceId, amount, paid, date, note }`
  - `bills` — `{ id, customerId, items: [{serviceId, price}], total, paid, due, createdAt }`
- Helper methods: `getAll`, `getById`, `add`, `update`, `delete`, `filter`

### Views / Pages
| Route         | View             | Description                              |
|---------------|------------------|------------------------------------------|
| `#dashboard`  | Dashboard        | Summary cards, quick stats, charts       |
| `#customers`  | Customer List    | Add/edit/delete customers, search        |
| `#billing`    | Billing          | Create bills, select customer & services |
| `#payments`   | Payments         | Record payments, track dues              |
| `#reports`    | Reports          | Income, Loss, Net, Pending amounts       |
| default       | Dashboard        | Fallback redirect                        |

### UI Components (`js/components.js`)
- `renderHeader()` — Navigation bar with active route highlighting
- `renderModal(title, bodyHtml)` — Reusable modal overlay
- `renderTable(headers, rows)` — Standard data table
- `renderCard(title, value, icon, color)` — Stat card for dashboard
- `renderForm(fields)` — Auto-generates form from field definitions

## Design System
- **Primary:** #8B5CF6 (violet)
- **Secondary:** #EC4899 (pink)
- **Accent:** #F59E0B (amber)
- **Success:** #10B981 (emerald)
- **Danger:** #EF4444 (red)
- **Font:** Inter (Google Fonts)
- **Layout:** Sidebar nav (desktop) → Bottom nav (mobile)
- **Cards:** White rounded-lg shadow-md with hover lift effect

## Project Structure
```
Glamora/
├── index.html          # Entry point, links all CSS/JS
├── AGENTS.md           # This file
├── css/
│   └── style.css       # All styles, responsive, themed
├── js/
│   ├── app.js          # Bootstrap — init router, render shell
│   ├── router.js       # Hash-based SPA router
│   ├── store.js        # LocalStorage data layer
│   ├── components.js   # Reusable UI component builders
│   └── views/
│       ├── dashboard.js
│       ├── customers.js
│       ├── billing.js
│       ├── payments.js
│       └── reports.js
└── assets/
    └── (icons/images if needed)
```

## Development Workflow
1. Start with `index.html` — load all CSS then JS in order
2. Build `css/style.css` — global reset, variables, layout, components
3. Build `js/store.js` — data layer first (no UI dependency)
4. Build `js/router.js` — thin routing wrapper
5. Build `js/components.js` — reusable UI builders
6. Build `js/views/*.js` — one by one, each self-contained
7. Build `js/app.js` — wire everything together

## Key Behaviors
- **No page reloads** — all navigation is client-side
- **Forms** submit via JS event listeners, not `<form action>`
- **Ids** generated with `crypto.randomUUID()` or `Date.now().toString(36)`
- **Currency** formatting: `₹{amount}.toFixed(2)` (Indian Rupee)
- **Empty states** — show friendly illustration + message when no data
- **Animations** — subtle fade-in on route change, hover transitions on cards
- **Mobile-first** responsive design, sidebar collapses to hamburger on small screens

## Bill Generation
- User selects a customer, then picks services (multi-select with quantities)
- Bill preview updates in real-time
- On save: creates a `bill` record + a `transaction` record
- "Paid" toggle — if unchecked, `due > 0` and tracked as pending

## Reports & Loss/Income
- **Income:** Sum of all `paid` amounts
- **Pending:** Sum of all `due` amounts (customers who said pay later)
- **Loss:** Sum of unpaid/due amounts that are marked as unrecoverable
- **Net:** Income - Loss
- Visual: Bar chart showing monthly income vs pending

## Future Enhancements (Phase 2)
- Export bills as PDF (using `window.print()` or jsPDF CDN)
- Dark mode toggle
- Service categories management
- Export/Import data as JSON
