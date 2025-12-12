Acadsync – Modular SaaS Platform for Schools

Acadsync is a modular SaaS application built using the MERN stack, featuring a dynamic pricing engine, JWT authentication, Razorpay payment gateway integration, and role-based dashboards.

This platform allows schools to subscribe to customizable modules (portals and add-on features) and complete payments using Razorpay Test Mode.

Features
User Authentication
Register and login using JWT
Role-based access control (Admin / User)
Protected routes on both frontend and backend
Dynamic Pricing Engine

Users can select:
Portals: School Admin, Teacher, Student
Add-on Features: Advanced Analytics, In-app Messaging, Extra Storage
Pricing is automatically calculated based on:
Base package cost
Additional feature cost
Bundle discount (auto-applied)
Final total returned by the backend
Razorpay Payment Integration (Test Mode)

Dynamic order creation on backend

Razorpay Checkout popup integration

Payment signature verification using HMAC SHA-256

Backend securely verifies payment before approval

Ready for production onboarding after Razorpay KYC

Modular Backend Architecture

Clean Express routing

Mongoose models for database operations

MongoDB Atlas integration

Subscription persistence support (optional feature)

Modern Frontend (React + Vite + TypeScript)

Responsive UI

Reusable components

Dynamic pricing selector

Checkout page with Razorpay integration

Tech Stack
Frontend

React (TypeScript)

Vite

Axios

Backend

Node.js

Express

MongoDB (Atlas)

Mongoose

Razorpay Node SDK

JSON Web Tokens

Additional Tools

dotenv

crypto (signature verification)

Environment Variables
Backend .env
PORT=5000
MONGO_URI=your_mongo_atlas_url
JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173

Frontend .env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx

Backend Setup
cd backend
npm install
npm run dev

Frontend Setup
cd frontend
npm install
npm run dev

Local Development URLs

Frontend: http://localhost:5173

Backend: http://localhost:5000
