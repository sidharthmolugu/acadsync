# Acadsync SaaS Assignment

Full-stack SaaS platform with dynamic pricing and Razorpay integration.

## Tech Stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JWT
- **Payments:** Razorpay Checkout

## Features

### User Authentication
- Register and login with JWT-based authentication.
- User data stored in MongoDB Atlas.

### SaaS Product Offering
- 3 portals: School Admin, Teacher, Student.
- Dynamic pricing based on:
  - Selected portals
  - Optional add-on features (analytics, messaging, storage)
- Bundle discounts for combinations of portals.

### Razorpay Integration
- Backend endpoint to create Razorpay order.
- Frontend Razorpay checkout widget.
- Payment verification endpoint that:
  - Validates Razorpay signature
  - Creates a subscription record for the user
  - Marks subscription as `paid` or `failed`
  - Sets 30-day validity for successful payments.

### User Dashboard
- Shows logged-in user details.
- Dynamic pricing selector for portals and features.
- Razorpay checkout button.
- Displays active subscriptions.

### Admin Portal
- List all registered users.
- List all payments/subscriptions with:
  - User name & email
  - Portals & features
  - Amount & status
  - Creation time

---

## Project Structure

```bash
acadsync-saas/
  backend/
    src/
      index.js           # Express app & Mongo connection
      models/User.js     # User + embedded subscription schema
      middleware/auth.js # JWT auth & admin guard
      routes/
        auth.js          # /api/auth/register, /login
        pricing.js       # /api/pricing/calculate
        payments.js      # /api/payments/create-order, /verify
        user.js          # /api/user/me
        admin.js         # /api/admin/users, /payments
    .env.example
    package.json

  frontend/
    src/
      main.tsx
      App.tsx
      api/client.ts
      context/AuthContext.tsx
      components/
        Layout.tsx
        ProtectedRoute.tsx
        PricingSelector.tsx
      pages/
        Login.tsx
        Register.tsx
        Dashboard.tsx
        Admin.tsx
        NotFound.tsx
      styles.css
    index.html
    vite.config.ts
    tsconfig.json
    package.json
```

---

## Setup Instructions

### 1. MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user and get the connection string.
3. Whitelist your IP (or enable access from anywhere for local dev).

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with:
# - MONGO_URI
# - JWT_SECRET
# - RAZORPAY_KEY_ID
# - RAZORPAY_KEY_SECRET
# - CLIENT_URL (default: http://localhost:5173)

npm install
npm run dev
```

The backend runs on `http://localhost:5000`.

#### Important environment variables

- `MONGO_URI` – MongoDB Atlas connection string.
- `JWT_SECRET` – any strong random string.
- `RAZORPAY_KEY_ID` – Razorpay dashboard.
- `RAZORPAY_KEY_SECRET` – Razorpay dashboard.
- `CLIENT_URL` – frontend origin for CORS.

### 3. Frontend

```bash
cd frontend
npm install
# Optional: create .env.local with:
# VITE_API_URL=http://localhost:5000/api
# VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

npm run dev
```

The frontend runs on `http://localhost:5173`.

---

## Core API Overview

### Auth

- `POST /api/auth/register` – `{ name, email, password }`
- `POST /api/auth/login` – `{ email, password }`

Returns `{ token, user }`.

### Pricing

- `POST /api/pricing/calculate`
  - Body: `{ portals: string[], features: string[] }`
  - Uses base prices and optional bundle discounts to compute total.

### Payments

- `POST /api/payments/create-order` (auth)
  - Body: `{ amount, currency, portals, features }`
  - Returns Razorpay order info.

- `POST /api/payments/verify` (auth)
  - Body: Razorpay handler payload + selection + amount.
  - Verifies signature, saves subscription on user document.

### User

- `GET /api/user/me` (auth)
  - Returns user profile + active paid subscriptions.

### Admin

- `GET /api/admin/users` (admin)
- `GET /api/admin/payments` (admin)

To make an admin user, manually update the user document in MongoDB:

```js
db.users.updateOne({ email: "someone@example.com" }, { $set: { role: "admin" } });
```

---

## Architecture Notes

- **Optimized DB access**
  - Lean queries where full Mongoose documents are not needed.
  - Index on `email` for fast login.
  - Embedded subscription documents inside user to keep reads simple.

- **Security**
  - Passwords hashed with `bcrypt`.
  - JWT-based auth with Bearer tokens.
  - Basic admin guard middleware.

- **Clean React structure**
  - `AuthContext` handles token + user persistence.
  - API client injects JWT automatically.
  - Reusable `PricingSelector` component for dynamic pricing.

---

## Screenshots (suggested)

When you run the app, capture:

1. Login / Register page
2. Dashboard with dynamic pricing selector
3. Razorpay checkout popup
4. Subscriptions section with at least one successful payment
5. Admin portal – users table & payments table

These can be attached to your submission or README images section.
