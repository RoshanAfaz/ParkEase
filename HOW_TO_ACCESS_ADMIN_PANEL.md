# 🔑 How to Access Admin Panel - Step by Step

## ⚠️ IMPORTANT: You Must Log In as Admin!

The admin panel is **role-based**. You need to log in with admin credentials to see admin features.

---

## 🎯 Quick Solution (3 Steps)

### Step 1: Check Your Current User
Go to: **http://localhost:5173/debug-user**

This page will show you:
- ✅ Your current email and role
- ✅ Whether you're admin or regular user
- ✅ What you should see based on your role

### Step 2: Log Out
Click the **"Sign Out"** button in the top right corner of the navbar

### Step 3: Log In as Admin
Use these credentials:
- **Email:** `admin@parkeasy.com`
- **Password:** `admin123`

---

## 🎨 What You'll See After Logging in as Admin

### In the Navbar:
```
ParkEase | Dashboard | Users | Parking Lots | Slots | Bookings | Analytics | [Admin User] [ADMIN] | Sign Out
```

You should see:
- ✅ Blue **"ADMIN"** badge next to your name
- ✅ **Different menu items:**
  - Dashboard (admin dashboard with statistics)
  - **Users** (NEW - user management)
  - Parking Lots
  - **Slots** (NEW - slot management)
  - Bookings
  - Analytics

### Admin Pages You Can Access:
1. **Dashboard** - `/admin/dashboard`
   - Real-time statistics
   - Auto-refresh every 30 seconds
   - Revenue tracking
   - Recent activities

2. **Users** - `/admin/users` ⭐ NEW
   - View all users
   - Search and filter
   - Create new users
   - Edit user details
   - Delete users
   - View user statistics

3. **Slots** - `/admin/slots` ⭐ NEW
   - Manage parking slots
   - Create single slots
   - **Bulk create** (e.g., A001-A050)
   - Edit slot properties
   - Delete slots
   - Grid and list views

4. **Parking Lots** - `/admin/parking-lots`
   - Manage parking lots

5. **Bookings** - `/admin/bookings`
   - View all bookings

6. **Analytics** - `/admin/analytics`
   - View analytics

---

## 🔍 Visual Comparison

### Regular User View:
```
┌─────────────────────────────────────────────────┐
│ ParkEase                                        │
│                                                 │
│ Dashboard | Find Parking | My Bookings          │
│                                                 │
│                           [John Doe] | Sign Out │
└─────────────────────────────────────────────────┘
```

### Admin View:
```
┌─────────────────────────────────────────────────────────────────┐
│ ParkEase                                                        │
│                                                                 │
│ Dashboard | Users | Parking Lots | Slots | Bookings | Analytics│
│                                                                 │
│                    [Admin User] [ADMIN 🔵] | Sign Out          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Test Accounts

### 🔑 Admin Account (Use This!)
```
Email:    admin@parkeasy.com
Password: admin123
Role:     admin
Access:   ✅ Full admin panel with all features
```

### 👤 Regular User 1
```
Email:    john@example.com
Password: password123
Role:     user
Access:   ❌ No admin features (user features only)
```

### 👤 Regular User 2
```
Email:    jane@example.com
Password: password123
Role:     user
Access:   ❌ No admin features (user features only)
```

---

## 🧪 Quick Test (2 Minutes)

### Test 1: Verify Current User
1. Go to: http://localhost:5173/debug-user
2. Check your current role
3. If it says "Regular User", you need to log in as admin

### Test 2: Log In as Admin
1. Click "Sign Out" (if logged in)
2. Go to: http://localhost:5173/login
3. Enter:
   - Email: `admin@parkeasy.com`
   - Password: `admin123`
4. Click "Sign In"

### Test 3: Verify Admin Access
After logging in, you should see:
- ✅ Blue "ADMIN" badge in navbar
- ✅ "Users" menu item
- ✅ "Slots" menu item
- ✅ Different dashboard with statistics

### Test 4: Try Admin Features
1. Click "Users" in navbar
2. You should see user management page
3. Try searching for "john"
4. Click "Add User" button
5. Click "Slots" in navbar
6. Select a parking lot
7. Click "Bulk Add" to create multiple slots

---

## 🐛 Troubleshooting

### Problem: I don't see admin menu items

**Solution:**
1. Go to http://localhost:5173/debug-user
2. Check if your role is "admin"
3. If not, log out and log in with admin@parkeasy.com

### Problem: I see "Not logged in" on debug page

**Solution:**
1. You're not logged in at all
2. Go to http://localhost:5173/login
3. Log in with admin@parkeasy.com / admin123

### Problem: I'm logged in as john or jane

**Solution:**
1. You're logged in as a regular user
2. Click "Sign Out"
3. Log in with admin@parkeasy.com / admin123

### Problem: Backend errors

**Solution:**
1. Check if backend is running: http://localhost:8000/docs
2. Check if MongoDB is running: `Get-Service MongoDB`
3. Restart backend: `uvicorn main:app --reload`

### Problem: Frontend not updating

**Solution:**
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard reload (Ctrl + Shift + R)
3. Try incognito/private window
4. Restart frontend: `npm run dev`

---

## 🎯 Expected Behavior

### When Logged in as Admin:
| Feature | Status |
|---------|--------|
| See "ADMIN" badge | ✅ YES |
| See "Users" menu | ✅ YES |
| See "Slots" menu | ✅ YES |
| Access /admin/dashboard | ✅ YES |
| Access /admin/users | ✅ YES |
| Access /admin/slots | ✅ YES |
| Create/edit/delete users | ✅ YES |
| Create/edit/delete slots | ✅ YES |
| View real-time statistics | ✅ YES |

### When Logged in as Regular User:
| Feature | Status |
|---------|--------|
| See "ADMIN" badge | ❌ NO |
| See "Users" menu | ❌ NO |
| See "Slots" menu | ❌ NO |
| Access /admin/* routes | ❌ NO (redirected) |
| See user dashboard | ✅ YES |
| Find parking | ✅ YES |
| View my bookings | ✅ YES |

---

## 🔧 Browser Console Check

If you want to verify in the browser console:

1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Run this command:

```javascript
// Check current user
fetch('http://localhost:8000/api/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('Current User:', data);
  console.log('Role:', data.role);
  console.log('Is Admin:', data.role === 'admin');
});
```

This will show you:
- Your current email
- Your role (admin or user)
- Whether you're admin

---

## 📸 Screenshots Reference

### What Admin Navbar Looks Like:
```
┌────────────────────────────────────────────────────────────────────┐
│  🚗 ParkEase                                                       │
│                                                                    │
│  [Dashboard] [Users] [Parking Lots] [Slots] [Bookings] [Analytics]│
│                                                                    │
│                                    👤 Admin User [ADMIN] [Sign Out]│
└────────────────────────────────────────────────────────────────────┘
```

### What Regular User Navbar Looks Like:
```
┌────────────────────────────────────────────────────────────────────┐
│  🚗 ParkEase                                                       │
│                                                                    │
│  [Dashboard] [Find Parking] [My Bookings]                         │
│                                                                    │
│                                          👤 John Doe [Sign Out]    │
└────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Verification Checklist

After logging in as admin, verify:
- [ ] I see "ADMIN" badge next to my name
- [ ] I see "Users" in the navbar
- [ ] I see "Slots" in the navbar
- [ ] I can access /admin/dashboard
- [ ] I can access /admin/users
- [ ] I can access /admin/slots
- [ ] Dashboard shows real-time statistics
- [ ] Users page shows user list
- [ ] Slots page shows slot management

If all checked, **you're successfully logged in as admin!** 🎉

---

## 🎓 Summary

**The key point:** Admin features are **role-based**. You MUST log in with the admin account to see them.

**Quick Steps:**
1. Go to http://localhost:5173/debug-user (check current user)
2. Log out if needed
3. Log in with: admin@parkeasy.com / admin123
4. You'll see admin panel with all features

**Admin Credentials (memorize this!):**
```
Email:    admin@parkeasy.com
Password: admin123
```

---

## 📞 Still Need Help?

If you're still not seeing admin features after following these steps:

1. **Check debug page:** http://localhost:5173/debug-user
2. **Check backend:** http://localhost:8000/docs
3. **Check MongoDB:** `Get-Service MongoDB`
4. **Clear cache:** Ctrl + Shift + Delete
5. **Try incognito window**
6. **Restart servers**

---

**Remember: You MUST use admin@parkeasy.com to see admin features!** 🔑