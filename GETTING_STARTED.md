# 🚀 Getting Started with ParkEasy

Follow this step-by-step checklist to get ParkEasy up and running on your machine.

## ✅ Pre-Installation Checklist

### Required Software

- [ ] **Node.js** (v18 or higher)
  - Download: https://nodejs.org/
  - Verify: `node --version`

- [ ] **Python** (v3.8 or higher)
  - Download: https://www.python.org/
  - Verify: `python --version`

- [ ] **MongoDB** (Choose one option)
  - [ ] **Option A**: Local MongoDB Community Edition
    - Download: https://www.mongodb.com/try/download/community
    - Verify: `mongod --version`
  - [ ] **Option B**: MongoDB Atlas (Cloud)
    - Sign up: https://www.mongodb.com/cloud/atlas
    - Create free cluster
    - Get connection string

- [ ] **MongoDB Compass** (Optional but recommended)
  - Download: https://www.mongodb.com/try/download/compass
  - For visual database management

## 📋 Installation Steps

### Step 1: MongoDB Setup

#### If using Local MongoDB:
- [ ] Install MongoDB Community Edition
- [ ] Start MongoDB service
  ```powershell
  net start MongoDB
  ```
- [ ] Verify it's running
  ```powershell
  Get-Service MongoDB
  ```
- [ ] Your connection string: `mongodb://localhost:27017`

#### If using MongoDB Atlas:
- [ ] Create MongoDB Atlas account
- [ ] Create a free cluster (M0)
- [ ] Create database user
- [ ] Whitelist IP address (0.0.0.0/0 for development)
- [ ] Get connection string
- [ ] Replace `<password>` in connection string

### Step 2: Backend Setup

- [ ] Open PowerShell in project directory
- [ ] Navigate to backend folder
  ```powershell
  cd backend
  ```

- [ ] Create virtual environment
  ```powershell
  python -m venv venv
  ```

- [ ] Activate virtual environment
  ```powershell
  .\venv\Scripts\activate
  ```
  You should see `(venv)` in your prompt

- [ ] Install Python dependencies
  ```powershell
  pip install -r requirements.txt
  ```
  This may take a few minutes

- [ ] Create .env file
  ```powershell
  copy .env.example .env
  ```

- [ ] Edit .env file with your settings
  ```powershell
  notepad .env
  ```
  
  **Minimum required settings:**
  ```env
  MONGODB_URL=mongodb://localhost:27017
  # OR for Atlas: mongodb+srv://username:password@cluster.mongodb.net/
  
  DATABASE_NAME=parkeasy
  
  SECRET_KEY=your-super-secret-key-change-this
  # Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```

- [ ] Generate SECRET_KEY
  ```powershell
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
  Copy the output and paste it in .env as SECRET_KEY

- [ ] Seed the database with sample data
  ```powershell
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

- [ ] Start the backend server
  ```powershell
  python main.py
  ```
  
  You should see:
  ```
  INFO:     Uvicorn running on http://0.0.0.0:8000
  ```

- [ ] Test backend (open in browser)
  - [ ] http://localhost:8000 - Should show welcome message
  - [ ] http://localhost:8000/docs - Should show API documentation
  - [ ] http://localhost:8000/health - Should show {"status": "healthy"}

### Step 3: Frontend Setup

- [ ] Open NEW PowerShell window in project root
- [ ] Install Node.js dependencies
  ```powershell
  npm install
  ```
  This may take a few minutes

- [ ] Create .env file
  ```powershell
  copy .env.example .env
  ```

- [ ] Edit .env file
  ```powershell
  notepad .env
  ```
  
  Set:
  ```env
  VITE_API_URL=http://localhost:8000
  ```

- [ ] Start the frontend development server
  ```powershell
  npm run dev
  ```
  
  You should see:
  ```
  VITE v5.4.2  ready in 500 ms
  ➜  Local:   http://localhost:5173/
  ```

- [ ] Open application in browser
  - [ ] http://localhost:5173

### Step 4: Verify Installation

- [ ] Backend is running on http://localhost:8000
- [ ] Frontend is running on http://localhost:5173
- [ ] API docs accessible at http://localhost:8000/docs
- [ ] MongoDB is connected (check backend logs)

### Step 5: Test the Application

#### Test User Registration:
- [ ] Go to http://localhost:5173
- [ ] Click "Sign Up"
- [ ] Fill in registration form
- [ ] Submit and verify you're logged in

#### Test with Seeded Accounts:
- [ ] Login as admin: `admin@parkeasy.com` / `admin123`
- [ ] Verify admin dashboard is accessible
- [ ] Logout
- [ ] Login as user: `john@example.com` / `password123`
- [ ] Verify user dashboard is accessible

#### Test Core Features:
- [ ] Browse parking lots
- [ ] View parking lot details
- [ ] Add a vehicle (in user dashboard)
- [ ] Create a booking
- [ ] View booking with QR code
- [ ] Check email for confirmation (if SMTP configured)

#### Test Admin Features (login as admin):
- [ ] View admin dashboard
- [ ] Check analytics
- [ ] View all bookings
- [ ] Create new parking lot
- [ ] Manage parking slots

### Step 6: Verify Database

- [ ] Open MongoDB Compass
- [ ] Connect to your MongoDB instance
  - Local: `mongodb://localhost:27017`
  - Atlas: Your connection string
- [ ] Select `parkeasy` database
- [ ] Verify collections exist:
  - [ ] users
  - [ ] parking_lots
  - [ ] parking_slots
  - [ ] bookings
  - [ ] vehicles
  - [ ] reviews
- [ ] Browse data in each collection

## 🎉 Success Checklist

If you can check all these boxes, you're ready to go!

- [ ] Backend server running without errors
- [ ] Frontend server running without errors
- [ ] Can access frontend in browser
- [ ] Can access API docs
- [ ] Can register new user
- [ ] Can login with test accounts
- [ ] Can view parking lots
- [ ] Can create bookings
- [ ] Database is populated with sample data
- [ ] MongoDB Compass shows data

## 🔧 Quick Commands Reference

### Backend Commands
```powershell
# Navigate to backend
cd backend

# Activate virtual environment
.\venv\Scripts\activate

# Start server
python main.py

# Seed database
python seed_data.py

# Install new package
pip install package-name
pip freeze > requirements.txt
```

### Frontend Commands
```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

### MongoDB Commands
```powershell
# Start MongoDB service (Windows)
net start MongoDB

# Stop MongoDB service
net stop MongoDB

# Check MongoDB status
Get-Service MongoDB

# Connect with mongo shell
mongosh
```

## 🚀 Using Batch Scripts (Windows)

For easier management, use the provided batch scripts:

- [ ] **setup_backend.bat** - One-click backend setup
  ```powershell
  .\setup_backend.bat
  ```

- [ ] **start_backend.bat** - Start backend server
  ```powershell
  .\start_backend.bat
  ```

- [ ] **start_frontend.bat** - Start frontend server
  ```powershell
  .\start_frontend.bat
  ```

- [ ] **start_all.bat** - Start both servers
  ```powershell
  .\start_all.bat
  ```

## 📚 Next Steps

Now that everything is running:

1. **Explore the Application**
   - [ ] Try all user features
   - [ ] Test admin features
   - [ ] Create multiple bookings
   - [ ] Add reviews

2. **Customize**
   - [ ] Update branding
   - [ ] Add more parking lots
   - [ ] Customize email templates
   - [ ] Adjust pricing

3. **Learn the Codebase**
   - [ ] Read [README.md](README.md)
   - [ ] Review [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
   - [ ] Check [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
   - [ ] Explore API docs at http://localhost:8000/docs

4. **Optional Enhancements**
   - [ ] Configure email notifications (SMTP)
   - [ ] Set up Stripe for payments
   - [ ] Add more parking lots
   - [ ] Customize UI theme

## ❓ Troubleshooting

### Backend won't start
- [ ] Check if virtual environment is activated
- [ ] Verify all dependencies installed: `pip install -r requirements.txt`
- [ ] Check MongoDB is running
- [ ] Verify .env file exists and has correct settings
- [ ] Check port 8000 is not in use

### Frontend won't start
- [ ] Check if node_modules exists: `npm install`
- [ ] Verify .env file exists
- [ ] Check port 5173 is not in use
- [ ] Clear cache: `rm -r node_modules`, then `npm install`

### Can't connect to MongoDB
- [ ] Check MongoDB service is running: `Get-Service MongoDB`
- [ ] Start MongoDB: `net start MongoDB`
- [ ] Verify connection string in backend/.env
- [ ] Test connection in MongoDB Compass

### API calls failing
- [ ] Verify backend is running
- [ ] Check VITE_API_URL in frontend .env
- [ ] Check browser console for errors
- [ ] Verify CORS settings in backend

### Authentication not working
- [ ] Clear browser localStorage
- [ ] Check SECRET_KEY in backend .env
- [ ] Verify JWT token in browser DevTools
- [ ] Try logging in with test accounts

## 📞 Getting Help

If you're stuck:

1. **Check Documentation**
   - [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) - Detailed setup
   - [README.md](README.md) - Project overview
   - [Backend README](backend/README.md) - API documentation

2. **Check Logs**
   - Backend terminal for server errors
   - Browser console for frontend errors
   - MongoDB logs for database issues

3. **Use Tools**
   - http://localhost:8000/docs - Test API endpoints
   - MongoDB Compass - View database
   - Browser DevTools - Debug frontend

4. **Common Issues**
   - Port already in use - Kill process or use different port
   - Module not found - Reinstall dependencies
   - Database connection - Check MongoDB is running
   - CORS errors - Verify backend CORS settings

## ✨ You're All Set!

Congratulations! You now have a fully functional parking management system running locally.

**Test Accounts:**
- Admin: `admin@parkeasy.com` / `admin123`
- User: `john@example.com` / `password123`

**Access Points:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

**Happy Coding! 🎉**

---

Need help? Check the troubleshooting section or review the documentation files.