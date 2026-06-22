# Flo

A Monzo-inspired digital wallet app built with the MERN stack. Flo lets users hold a balance, send money to other users, track spending, and set savings goals — all wrapped in a clean, card-based UI.

Built as a portfolio project to demonstrate full-stack engineering skills for fintech software engineering internship applications.

## Features

- **Authentication** — secure signup/login with JWT and bcrypt password hashing
- **Wallet** — deposit and withdraw funds, real-time balance tracking
- **Send money** — transfer funds to other Flo users by email
- **Transaction history** — filterable activity feed with running balance snapshots
- **Savings goals** — create targets, allocate funds from your wallet, track progress
- **Analytics** — visual breakdown of spending and income with interactive charts

## Tech stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- bcrypt.js for password hashing

**Frontend**
- React (Vite)
- Tailwind CSS
- React Router
- Recharts for data visualisation
- Axios

## Architecture

```
Frontend (React)
      │
      ▼
  HTTP Request
      │
      ▼
 server.js  →  connects DB, starts server
      │
      ▼
  app.js    →  middleware (CORS, JSON parsing)
      │
      ▼
  Routes    →  directs request to controller
      │
      ▼
 Middleware →  JWT auth check
      │
      ▼
Controller  →  business logic
      │
      ▼
  Models    →  MongoDB via Mongoose
      │
      ▼
  Response  →  back to frontend
```

The backend separates `server.js` (startup) from `app.js` (Express configuration) so the app can be imported and tested independently without binding to a port.

## Data model

Three core collections:

- **User** — name, email, hashed password, contact details
- **Wallet** — balance, currency, linked one-to-one with a User via reference
- **Transaction** — sender, recipient, type (deposit/withdrawal/transfer), amount, and a `balanceAfter` snapshot for fast balance reads and audit trail

Wallets and Users are linked by reference (`ObjectId`), not embedding — keeping the two concerns independent and queryable on their own.

## Known limitations

- **Transfer atomicity** — transfers update two wallet documents sequentially rather than within a MongoDB session/transaction. In production this would use `mongoose.startSession()` to guarantee both updates succeed or roll back together.
- **Token storage** — JWTs are stored in `localStorage` rather than httpOnly cookies, trading some XSS resistance for simpler local development.
- **No automated tests yet** — planned as a next step.

## Getting started

### Prerequisites
- Node.js (v18+)
- A MongoDB connection string (Atlas or local)

### Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the server:
```bash
npm run dev
```

### Frontend setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`, with the API running on `http://localhost:5000`.

## Roadmap

- [ ] Mobile responsive layout
- [ ] Automated test coverage (Jest)
- [ ] MongoDB session-based transaction atomicity for transfers
- [ ] Rate limiting and input sanitisation
- [ ] Deployment (Railway + Vercel)
- [ ] Dark mode

## Author

Built by Yagya — BSc Computer Science (AI), University of Greenwich.
