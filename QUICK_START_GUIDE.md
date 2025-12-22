# 🚀 ParkEasy Admin Panel - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Verify MongoDB is Running
```powershell
Get-Service -Name MongoDB
```
✅ Should show "Running" status

---

### Step 2: Install Backend Dependencies
```powershell
cd "c:\college\dt\dt proj\project\backend"
pip install -r requirements.txt
```

---

### Step 3: Seed the Database (First Time Only)
```powershell
python seed_data.py
```
This creates:
- Admin account (admin@parkeasy.com / admin123)
- Test users
- Sample parking lots
- Sample parking slots
- Sample bookings

---

### Step 4: Start Backend Server
```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
✅ Backend running at: http://localhost:8000
✅ API docs at: http://localhost:8000/docs

---

### Step 5: Install Frontend Dependencies (if needed)
```powershell
cd "c:\college\dt\dt proj\project"
npm install
```

---

### Step 6: Start Frontend
```powershell
npm run dev
```
✅ Frontend running at: http://localhost:5173

---

## 🔐 Login to Admin Panel

1. Open browser: http://localhost:5173
2. Click "Login" button
3. Enter credentials:
   - **Email:** admin@parkeasy.com
   - **Password:** admin123
4. You'll be redirected to Admin Dashboard

---

## 🎯 Quick Feature Tour

### 1. Admin Dashboard (`/admin/dashboard`)
- View real-time statistics
- See total users, lots, slots, bookings
- Check revenue (total & today)
- View recent activities
- Auto-refreshes every 30 seconds

### 2. User Management (`/admin/users`)
- Click "Users" in the navbar
- **Search:** Type in search box to find users
- **Filter:** Select role (All/Admin/User)
- **View Details:** Click eye icon to see user stats
- **Add User:** Click "Add User" button
- **Edit User:** Click edit icon
- **Delete User:** Click delete icon (with confirmation)

### 3. Slot Management (`/admin/slots`)
- Click "Slots" in the navbar
- **Select Lot:** Choose parking lot from dropdown
- **Toggle View:** Switch between Grid and List view
- **Add Single Slot:** Click "Add Slot" button
- **Add Bulk Slots:** Click "Bulk Add" button (e.g., A001-A050)
- **Edit Slot:** Click edit icon
- **Delete Slot:** Click delete icon
- **Filter Status:** Use status filter dropdown

---

## 🧪 Quick Test Scenarios

### Test 1: Create a New User
1. Go to Users page
2. Click "Add User"
3. Fill in:
   - Email: test@example.com
   - Password: test123
   - Full Name: Test User
   - Phone: 1234567890
   - Role: User
4. Click "Create User"
5. ✅ User should appear in the list

### Test 2: Create Bulk Slots
1. Go to Slots page
2. Select a parking lot
3. Click "Bulk Add"
4. Fill in:
   - Prefix: B
   - Start: 1
   - End: 20
   - Type: Regular
   - Floor: 2
5. Click "Create Slots"
6. ✅ 20 slots (B001-B020) should be created

### Test 3: View Real-time Stats
1. Go to Dashboard
2. Note the "LIVE" indicator
3. Wait 30 seconds
4. ✅ Stats should auto-refresh
5. Click refresh icon for manual update

---

## 🔍 API Testing (Optional)

### Using FastAPI Docs:
1. Open: http://localhost:8000/docs
2. Click "Authorize" button
3. Login to get token
4. Test any endpoint directly

### Example Endpoints:
```
GET  /api/admin/users              - List all users
GET  /api/admin/stats/realtime     - Get dashboard stats
POST /api/admin/slots              - Create a slot
POST /api/admin/slots/bulk         - Create multiple slots
```

---

## 📊 Database Inspection (Optional)

### Using MongoDB Compass:
1. Open MongoDB Compass
2. Connect to: mongodb://localhost:27017
3. Select database: parkeasy
4. View collections:
   - users
   - parking_lots
   - parking_slots
   - bookings
   - vehicles
   - reviews

---

## 🐛 Troubleshooting

### Backend won't start:
```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <process_id> /F
```

### Frontend won't start:
```powershell
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Kill process if needed
taskkill /PID <process_id> /F
```

### MongoDB not running:
```powershell
# Start MongoDB service
Start-Service MongoDB

# Or restart it
Restart-Service MongoDB
```

### Can't login:
1. Verify backend is running (http://localhost:8000/docs)
2. Check browser console for errors
3. Try re-seeding database: `python seed_data.py`
4. Clear browser cache and cookies

### API errors:
1. Check backend terminal for error messages
2. Verify MongoDB is running
3. Check .env file configuration
4. Verify JWT token is valid (check expiration)

---

## 🎨 UI Features to Explore

### Animations:
- Hover over cards to see scale effect
- Watch the "LIVE" badge pulse
- Notice smooth transitions on modals
- See loading states during API calls

### Responsive Design:
- Resize browser window
- Check mobile view
- Test tablet view

### Color Coding:
- 🟢 Green = Available/Success
- 🔴 Red = Occupied/Error
- 🟡 Yellow = Reserved/Warning
- 🔵 Blue = Admin role
- ⚫ Gray = Maintenance/Inactive

---

## 📱 Navigation Map

```
Home (/)
├── Login (/login)
├── Register (/register)
└── Admin Panel (requires admin login)
    ├── Dashboard (/admin/dashboard)
    ├── Users (/admin/users)
    └── Slots (/admin/slots)
```

---

## 🔑 Test Accounts

### Admin Account:
- Email: admin@parkeasy.com
- Password: admin123
- Access: Full admin panel

### Test User 1:
- Email: john@example.com
- Password: password123
- Access: Regular user features

### Test User 2:
- Email: jane@example.com
- Password: password123
- Access: Regular user features

---

## 💾 Data Seeding Details

The `seed_data.py` script creates:
- **1 Admin user**
- **2 Regular users**
- **3 Parking lots** (Downtown, Airport, Mall)
- **30 Parking slots** (10 per lot)
- **Sample bookings** with various statuses
- **Sample vehicles** for users
- **Sample reviews** for lots

---

## 🎯 Common Tasks

### Add a new admin:
1. Go to Users page
2. Click "Add User"
3. Set Role to "Admin"
4. Fill other details
5. Create user

### Change user to admin:
1. Go to Users page
2. Find the user
3. Click edit icon
4. Change Role to "Admin"
5. Save changes

### Create parking slots for new lot:
1. First, create lot via API or database
2. Go to Slots page
3. Select the new lot
4. Use "Bulk Add" to create multiple slots
5. Specify range (e.g., A001-A100)

### Reset user password:
1. Go to Users page
2. Find the user
3. Click edit icon
4. Enter new password
5. Save changes

---

## 📈 Performance Tips

### For Better Performance:
1. Use pagination for large user lists
2. Filter slots by status to reduce load
3. Use search to find specific users quickly
4. Close unused modals
5. Refresh dashboard manually instead of waiting

### Browser Recommendations:
- Chrome (recommended)
- Firefox
- Edge
- Safari (may have minor styling differences)

---

## 🔐 Security Reminders

### In Production:
1. ⚠️ Change SECRET_KEY in .env
2. ⚠️ Use strong admin password
3. ⚠️ Enable HTTPS
4. ⚠️ Set up proper CORS
5. ⚠️ Use environment variables
6. ⚠️ Enable rate limiting
7. ⚠️ Regular security audits

---

## 📞 Need Help?

### Resources:
1. **Full Documentation:** See ADMIN_FEATURES_SUMMARY.md
2. **API Docs:** http://localhost:8000/docs
3. **Code Comments:** Check source files
4. **Browser Console:** Press F12 for debugging
5. **Backend Logs:** Check terminal output

---

## ✅ Verification Checklist

After setup, verify:
- [ ] MongoDB service is running
- [ ] Backend server is running (port 8000)
- [ ] Frontend server is running (port 5173)
- [ ] Can access login page
- [ ] Can login as admin
- [ ] Can see dashboard with stats
- [ ] Can navigate to Users page
- [ ] Can navigate to Slots page
- [ ] Can create/edit/delete users
- [ ] Can create/edit/delete slots
- [ ] Real-time stats are updating

---

## 🎉 You're All Set!

Your ParkEasy admin panel is now fully functional with:
✅ User Management
✅ Slot Management
✅ Real-time Statistics
✅ Beautiful UI
✅ Secure Authentication

**Enjoy managing your parking system! 🚗🅿️**

---

*For detailed technical information, see ADMIN_FEATURES_SUMMARY.md*