# ⚡ Quick Start Guide - ParkEasy

Get ParkEasy running in 5 minutes!

## 🎯 Prerequisites

Make sure you have installed:
- ✅ Node.js (v18+)
- ✅ Python (v3.8+)
- ✅ MongoDB (local or Atlas account)

## 🚀 5-Minute Setup

### Step 1: Install MongoDB (Choose One)

**Option A: MongoDB Atlas (Easiest - Cloud)**
```
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create cluster (M0 Free)
4. Get connection string
```

**Option B: Local MongoDB**
```powershell
# Download from: https://www.mongodb.com/try/download/community
# Install and start service
net start MongoDB
```

### Step 2: Backend Setup (2 minutes)

```powershell
# Run automated setup
.\setup_backend.bat

# Edit backend\.env - set your MongoDB URL
notepad backend\.env

# Seed database with sample data
cd backend
.\venv\Scripts\activate
python seed_data.py
```

### Step 3: Start Servers (1 minute)

```powershell
# Start both backend and frontend
.\start_all.bat
```

That's it! 🎉

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔑 Test Accounts

Login with these pre-created accounts:

**Admin:**
- Email: `admin@parkeasy.com`
- Password: `admin123`

**User:**
- Email: `john@example.com`
- Password: `password123`

## ✅ Quick Test

1. Open http://localhost:5173
2. Click "Sign In"
3. Login with test account
4. Browse parking lots
5. Create a booking
6. View your QR code!

## 🔧 Manual Setup (If Scripts Don't Work)

### Backend:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your settings
python seed_data.py
python main.py
```

### Frontend:
```powershell
npm install
copy .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000
npm run dev
```

## 🆘 Troubleshooting

### Backend won't start?
```powershell
# Check MongoDB is running
Get-Service MongoDB
net start MongoDB

# Reinstall dependencies
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend won't start?
```powershell
# Reinstall dependencies
rm -r node_modules
npm install
```

### Can't connect to MongoDB?
```powershell
# Local MongoDB
net start MongoDB

# Or use MongoDB Atlas connection string in backend\.env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/
```

## 📚 Full Documentation

For detailed instructions, see:
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Step-by-step checklist
- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Comprehensive guide
- **[README.md](README.md)** - Project overview

## 🎯 What's Included

- ✅ User authentication
- ✅ Parking lot browsing
- ✅ Real-time booking
- ✅ QR code generation
- ✅ Email notifications
- ✅ Admin dashboard
- ✅ Analytics
- ✅ Reviews & ratings
- ✅ Vehicle management

## 🚀 Next Steps

1. **Explore Features**
   - Try booking a parking spot
   - Add a vehicle
   - Leave a review
   - Check admin dashboard

2. **Customize**
   - Update branding
   - Add more parking lots
   - Configure email (optional)
   - Set up payments (optional)

3. **Deploy**
   - Backend: Railway, Render, AWS
   - Frontend: Vercel, Netlify
   - Database: MongoDB Atlas

## 💡 Pro Tips

- Use MongoDB Compass to view database visually
- Check http://localhost:8000/docs for API testing
- Clear browser localStorage if auth issues occur
- Keep both terminal windows open while developing

## 🎉 You're Ready!

Start exploring ParkEasy and make it your own!

**Happy Coding! 🚀**

---

Need help? Check the full documentation or troubleshooting guides.