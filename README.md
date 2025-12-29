# 🅿️ ParkEasy - Smart Parking Management System

A modern, full-stack parking management solution built with **React**, **FastAPI**, and **MongoDB**.

## 🚀 Features

### User Features
- 📍 **Smart Search**: Find parking lots near you with real-time availability.
- 📱 **Booking System**: Book slots, manage vehicles, and get QR codes for check-in.
- 💳 **Payments**: Integrated mock payment system (UPI/Card).
- 📧 **Notifications**: Email confirmations and booking receipt PDFs.
- 🚙 **Vehicle Management**: Add and manage multiple vehicles.
- 🌓 **Dark Mode**: Fully supported dark/light theme.

### Admin Features
- 📊 **Dashboard**: Real-time analytics, revenue tracking, and occupancy rates (with Recharts).
- 👥 **User Management**: Verify users, manage roles, and view user stats.
- 🅿️ **Lot Management**: Create/Edit parking lots and manage slots (CRUD).
- 📝 **Reviews**: Monitor and manage user reviews.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion, Vite.
- **Backend**: Python FastAPI, Motor (Async MongoDB), JWT Auth, Passlib.
- **Database**: MongoDB (Atlas or Local).

## 📋 Prerequisites

- **Node.js** (v18+)
- **Python** (v3.8+)
- **MongoDB** (Local or Cloud)

## ⚡ Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Configure .env with your MongoDB URL and Secret Key

# Seed Database (Creates Admin & Test Data)
python seed_data.py
python main.py
```

### 2. Frontend Setup
```bash
# In a new terminal (root directory)
npm install
cp .env.example .env
npm run dev
```

## 🔐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Default Credentials
- **Admin**: `admin@parkeasy.com` / `admin123`
- **User**: `rahul@example.com` / `password123`

## 📁 Project Structure

```
parkeasy/
├── backend/                 # FastAPI Application
│   ├── routers/             # API Endpoints
│   ├── models.py            # Pydantic Schemas
│   └── seed_data.py         # Data Seeding Script
├── src/                     # React Application
│   ├── pages/               # Route Components
│   ├── components/          # Reusable UI
│   └── lib/                 # API Clients
└── ...
```

## 📜 License
This project is for educational purposes.