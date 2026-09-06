# Cabin8

**Everything your furniture business needs, in one balanced space.**

A full-stack accounting system for furniture businesses — covering purchase-to-pay, order-to-cash, GST-compliant invoicing, and automatic double-entry bookkeeping, with an AI-powered invoice autofill feature.

---

## Features

- Purchase Orders → Vendor Bills → Payments, and Sales Orders → Customer Invoices → Payments
- Automatic, always-balanced double-entry journal entries on every confirmed transaction
- GST-aware invoicing (CGST/SGST vs IGST, based on company vs. party state)
- Manual journal entries, budgets, and live P&L / Balance Sheet reports
- Role-based access — `ADMIN`, `ACCOUNTANT`, `USER` (customer/vendor self-service portal)
- AI invoice autofill — upload a PDF/image invoice, get it auto-matched to contacts & products
- Global search, notifications, and a dashboard

---

## Architecture

```
frontend/  → React + Vite SPA
backend/   → Node.js + Express + Prisma + PostgreSQL API
ai/        → Python FastAPI microservice for AI invoice extraction
```

Frontend → Backend (REST) → Backend calls the AI service only when autofill is used.

**Stack:** React 19, Vite, Express, Prisma, PostgreSQL, JWT auth, PyMuPDF + Groq (AI service).

---

## Project Structure

```
backend/src/
  core/        → prismaClient, generic CRUD factory, sequence numbering, GST calc
  middleware/  → rbac.js (JWT auth + role checks)
  modules/     → auth, purchase, sales, payment, journalEntry, postingEngine,
                 budgetEngine, reports, dashboard, portal, search,
                 notifications, settings, ai

frontend/src/
  pages/       → auth, contacts, products, purchase, sales, accounting,
                 reports, budget, portal, settings, dashboard
  layout/      → AppLayout, Sidebar, Topbar
  api/ hooks/ utils/ context/ routes/

ai/ai_document_autofill/
  app/main.py       → FastAPI upload route + PDF text extraction (PyMuPDF)
  app/ai_service.py → Groq LLM calls (text + vision extraction)
  app/schemas.py     → response schema
  app/validator.py    → sanity-checks extracted totals
```

---

## Getting Started

**Requires:** Node.js 18+, PostgreSQL, Python 3.10+ & a Groq API key (only for AI autofill)

```bash
git clone https://github.com/Mayank-Sati-07/Cabin8.git
cd Cabin8
```

**Backend**
```bash
cd backend
npm install
# set DATABASE_URL, JWT_SECRET, PORT, AI_SERVICE_URL in .env
npx prisma migrate dev
npm run db:seed
npm run dev          # http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev           # http://localhost:5173
```

**AI service** (optional)
```bash
cd ai/ai_document_autofill
pip install -r requirements.txt
cp .env.example .env  # add GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

---

## Roles

| Role | Access |
|---|---|
| ADMIN | Full access — users, deletions, cancellations, resets |
| ACCOUNTANT | Day-to-day operations — orders, bills, invoices, payments |
| USER | Portal only — own invoices, bills & payments |

---

