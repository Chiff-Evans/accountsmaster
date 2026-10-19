# Information Management System

## Tech Stack
- **Backend**: Node.js + Express + MySQL2
- **Frontend**: React 18 + Vite + Ant Design 5 + Recharts
- **Database**: MySQL (via XAMPP)

---

## Quick Setup

### 1. Database
1. Start **XAMPP** — start Apache and MySQL
2. Open **phpMyAdmin** → http://localhost/phpmyadmin
3. Create database (or use the SQL import):
   - Click **Import** → select `server/database/schema.sql` → Go
   - This creates the `accountsmaster` database with all tables + seed data

### 2. Backend
```bash
cd server
npm install
# .env is already configured for XAMPP defaults (root / no password)
# Edit .env if your MySQL credentials differ
npm run dev
```
Server starts on **http://localhost:8000**

### 3. Frontend
```bash
cd client
npm install
npm run dev
```
Frontend starts on **http://localhost:3000**

---

## Default Login
| Field    | Value     |
|----------|-----------|
| Username | `admin`   |
| Password | `password` |

> The admin password in the schema hash is for `password`. Change it immediately after first login via Users → Reset Password.

---

## Features

### Configurations
- **Business Setup** — company info
- **Menu Management** — dynamic hierarchical menus (self-referencing)
- **Roles & Groups** — roles with per-menu CRUD access rights, user assignment
- **Process Types** — define business processes
- **Reference Numbering** — auto-generated ref numbers per process (e.g. ORD-2026-00001)

### User Management
- User registration with roles
- Lock / Suspend / Revoke / Activate actions
- Reset password
- Session tracking

### Stock Management
- Categories & Sub-categories
- Units of Measure
- Items Catalogue (with stock quantity view)
- Stock Entry (running ledger)
- Price Management (with date ranges, bulk pricing)

### Client Management
- Client registration with auto ref numbers
- Shops linked to clients with geolocation

### Supplier Management
- Supplier registration with auto ref numbers
- Link supply items per supplier

### Orders Management
- Create orders with multiple items
- Full workflow engine:
  `Draft → Pending → Confirmed → Processing → Shipped → Delivered → Completed`
  (with On Hold, Cancelled, Awaiting Payment, Payment Done, Refunded, Returned)
- View order detail with item breakdown

### Dashboard
- Summary cards (orders, revenue, clients, items, suppliers, low stock)
- 30-day order & revenue trend line chart
- Orders by workflow status (pie chart)
- Top 10 items by sales volume (bar chart)
- Recent orders table

---

## Project Structure
```
accountsmaster/
├── server/
│   ├── src/
│   │   ├── config/db.js          MySQL connection pool
│   │   ├── middleware/            auth.js, errorHandler.js
│   │   ├── helpers/refNumber.js   Auto-increment ref generator
│   │   └── routes/               One file per resource
│   ├── database/schema.sql
│   ├── .env
│   └── package.json
└── client/
    ├── src/
    │   ├── api/index.js           Axios instance with JWT interceptors
    │   ├── contexts/AuthContext   User + dynamic menus state
    │   ├── components/layout/     AppLayout, Sidebar (dynamic), AppHeader
    │   ├── components/common/     CrudTable (reusable)
    │   └── pages/                 One folder per module
    ├── vite.config.js             /api proxy → localhost:8000
    └── package.json
```

---

## Adding a New Menu Item
1. Go to **Configurations → Menu Management** → Add New
2. Set `view_path` to a React route (e.g. `/stock/items`)
3. Go to **Roles & Groups** → open a role → Manage Access → tick permissions
4. Users with that role will see the menu on next login/refresh

## Environment Variables (server/.env)
| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8000 | API server port |
| DB_HOST | localhost | MySQL host |
| DB_USER | root | MySQL user |
| DB_PASSWORD | (blank) | MySQL password for XAMPP |
| DB_NAME | accountsmaster | Database name |
| JWT_SECRET | (set in .env) | Change in production! |
