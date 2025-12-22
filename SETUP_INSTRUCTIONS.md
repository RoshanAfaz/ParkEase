# 🅿️ ParkEasy - Complete Setup Instructions

A modern parking management system with React + TypeScript frontend and Python FastAPI + MongoDB backend.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Running the Application](#running-the-application)
5. [Features](#features)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **MongoDB** - Choose one:
  - Local: [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)
- **MongoDB Compass** (Optional but recommended) - [Download](https://www.mongodb.com/try/download/compass)

### Optional
- **Git** - For version control
- **VS Code** - Recommended IDE

## 🚀 Quick Start

### 1. Install MongoDB

**Windows (Local):**
```powershell
# Download MongoDB Community Edition installer
# Run installer and follow prompts
# MongoDB will start automatically as a service

# Verify installation
mongod --version
```

**MongoDB Atlas (Cloud - Recommended for beginners):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Copy connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 2. Setup Backend

```powershell
# Open PowerShell in project directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env file with your settings
notepad .env
```

**Minimum .env configuration:**
```env
MONGODB_URL=mongodb://localhost:27017
# OR for MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/

DATABASE_NAME=parkeasy
SECRET_KEY=your-super-secret-key-change-this-now
```

### 3. Seed Database

```powershell
# Still in backend directory with venv activated
python seed_data.py
```

You should see:
```
✓ Admin user created: admin@parkeasy.com / admin123
✓ User created: john@example.com / password123
✓ Parking lot created: Downtown Parking Center
...
Database seeding completed successfully!
```

### 4. Start Backend Server

```powershell
# In backend directory
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Test it:** Open http://localhost:8000/docs in your browser

### 5. Setup Frontend

```powershell
# Open NEW PowerShell window in project root
# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env
notepad .env
```

**Frontend .env:**
```env
VITE_API_URL=http://localhost:8000
```

### 6. Start Frontend

```powershell
# In project root directory
npm run dev
```

You should see:
```
VITE v5.4.2  ready in 500 ms
➜  Local:   http://localhost:5173/
```

### 7. Open Application

Open your browser and go to: **http://localhost:5173**

## 📖 Detailed Setup

### MongoDB Setup (Detailed)

#### Option A: Local MongoDB

1. **Download MongoDB Community Edition**
   - Visit: https://www.mongodb.com/try/download/community
   - Select your OS (Windows)
   - Download and run installer

2. **Installation**
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)
   - Install MongoDB Compass (GUI tool)

3. **Verify Installation**
   ```powershell
   # Check if MongoDB service is running
   Get-Service MongoDB
   
   # Should show: Status = Running
   ```

4. **Connection String**
   ```
   mongodb://localhost:27017
   ```

#### Option B: MongoDB Atlas (Cloud)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select region closest to you
   - Click "Create Cluster"

3. **Setup Access**
   - **Database Access**: Create user with password
   - **Network Access**: Add IP (0.0.0.0/0 for development)

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

### Backend Setup (Detailed)

1. **Create Virtual Environment**
   ```powershell
   cd backend
   python -m venv venv
   ```

2. **Activate Virtual Environment**
   ```powershell
   # Windows PowerShell
   .\venv\Scripts\activate
   
   # You should see (venv) in your prompt
   ```

3. **Install Dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Configure Environment**
   ```powershell
   copy .env.example .env
   ```

   Edit `.env` file:
   ```env
   # MongoDB Configuration
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=parkeasy

   # JWT Configuration (IMPORTANT: Change this!)
   SECRET_KEY=generate-a-random-string-here-use-at-least-32-characters
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30

   # Email Configuration (Optional - for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   EMAIL_FROM=noreply@parkeasy.com

   # Application Configuration
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:8000
   ```

   **Generate SECRET_KEY:**
   ```powershell
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

5. **Seed Database**
   ```powershell
   python seed_data.py
   ```

6. **Start Server**
   ```powershell
   python main.py
   ```

   Or with custom settings:
   ```powershell
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup (Detailed)

1. **Install Dependencies**
   ```powershell
   # In project root
   npm install
   ```

2. **Configure Environment**
   ```powershell
   copy .env.example .env
   ```

   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_APP_NAME=ParkEasy
   ```

3. **Start Development Server**
   ```powershell
   npm run dev
   ```

4. **Build for Production**
   ```powershell
   npm run build
   npm run preview
   ```

## 🎯 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```powershell
cd backend
.\venv\Scripts\activate
python main.py
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

### Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### Test Accounts

After seeding, you can login with:

**Admin Account:**
- Email: `admin@parkeasy.com`
- Password: `admin123`

**User Accounts:**
- Email: `john@example.com` / Password: `password123`
- Email: `jane@example.com` / Password: `password123`

## ✨ Features

### User Features
- ✅ User registration and authentication
- ✅ Browse parking lots with location-based search
- ✅ View real-time parking availability
- ✅ Book parking slots
- ✅ Manage multiple vehicles
- ✅ View booking history
- ✅ Extend booking time
- ✅ Cancel bookings
- ✅ Rate and review parking lots
- ✅ QR code for check-in/check-out
- ✅ Email notifications
- ✅ User dashboard with statistics

### Admin Features
- ✅ Admin dashboard with analytics
- ✅ Manage parking lots (CRUD)
- ✅ Manage parking slots
- ✅ View all bookings
- ✅ Update booking status
- ✅ Revenue analytics
- ✅ Occupancy tracking
- ✅ User management

### Technical Features
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ RESTful API
- ✅ MongoDB with indexes
- ✅ Async/await operations
- ✅ Input validation
- ✅ Error handling
- ✅ CORS configuration
- ✅ API documentation (Swagger/OpenAPI)

## 🧪 Testing

### Test Backend API

1. **Using Browser**
   - Go to http://localhost:8000/docs
   - Try endpoints interactively

2. **Using curl**
   ```powershell
   # Health check
   curl http://localhost:8000/health

   # Register user
   curl -X POST http://localhost:8000/api/auth/register `
     -H "Content-Type: application/json" `
     -d '{\"email\":\"test@example.com\",\"password\":\"test123\",\"full_name\":\"Test User\"}'

   # Login
   curl -X POST http://localhost:8000/api/auth/login `
     -H "Content-Type: application/json" `
     -d '{\"email\":\"test@example.com\",\"password\":\"test123\"}'
   ```

### Test Frontend

1. **Register New User**
   - Go to http://localhost:5173
   - Click "Sign Up"
   - Fill in details and register

2. **Browse Parking Lots**
   - Login with your account
   - View available parking lots
   - Check slot availability

3. **Make a Booking**
   - Add a vehicle first
   - Select a parking lot
   - Choose available slot
   - Complete booking

### View Database

**Using MongoDB Compass:**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select `parkeasy` database
4. Browse collections:
   - users
   - parking_lots
   - parking_slots
   - bookings
   - vehicles
   - reviews

## 🔧 Troubleshooting

### MongoDB Issues

**Problem: Can't connect to MongoDB**
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# Start MongoDB service
net start MongoDB

# Or restart
net stop MongoDB
net start MongoDB
```

**Problem: MongoDB Compass won't connect**
- Check connection string: `mongodb://localhost:27017`
- Ensure MongoDB service is running
- Check firewall settings

### Backend Issues

**Problem: Module not found**
```powershell
# Ensure virtual environment is activated
.\venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

**Problem: Port 8000 already in use**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use different port
uvicorn main:app --reload --port 8001
```

**Problem: Database connection error**
- Check `MONGODB_URL` in `.env`
- Verify MongoDB is running
- Test connection in MongoDB Compass

### Frontend Issues

**Problem: API calls failing**
- Check `VITE_API_URL` in `.env`
- Ensure backend is running
- Check browser console for CORS errors

**Problem: Port 5173 already in use**
```powershell
# Vite will automatically use next available port
# Or specify port:
npm run dev -- --port 3000
```

**Problem: Build errors**
```powershell
# Clear node_modules and reinstall
rm -r node_modules
rm package-lock.json
npm install
```

### Common Issues

**Problem: CORS errors**
- Check backend `config.py` CORS settings
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL

**Problem: Authentication not working**
- Clear browser localStorage: `localStorage.clear()`
- Check JWT token in browser DevTools → Application → Local Storage
- Verify `SECRET_KEY` in backend `.env`

**Problem: Email notifications not working**
- Email is optional - app works without it
- Check SMTP settings in `.env`
- For Gmail: Enable 2FA and create App Password

## 📚 Additional Resources

### Documentation
- **FastAPI**: https://fastapi.tiangolo.com/
- **MongoDB**: https://docs.mongodb.com/
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/

### Tools
- **MongoDB Compass**: GUI for MongoDB
- **Postman**: API testing
- **VS Code Extensions**:
  - Python
  - ESLint
  - Prettier
  - MongoDB for VS Code

## 🚀 Next Steps

1. **Customize the Application**
   - Update branding and colors
   - Add more parking lots
   - Customize email templates

2. **Add Payment Integration**
   - Set up Stripe account
   - Add Stripe keys to `.env`
   - Implement payment flow

3. **Deploy to Production**
   - Backend: Railway, Render, or AWS
   - Frontend: Vercel or Netlify
   - Database: MongoDB Atlas

4. **Enhance Features**
   - Real-time updates with WebSockets
   - Mobile app with React Native
   - Advanced analytics
   - Automated pricing

## 📞 Support

If you encounter issues:
1. Check this guide thoroughly
2. Review error messages carefully
3. Check backend logs
4. Use `/docs` endpoint for API testing
5. Verify database in MongoDB Compass

---

**Enjoy building with ParkEasy! 🎉**