# 🔍 How to Check Your Current User

## Quick Check in Browser Console

1. Open your browser (http://localhost:5173)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Type this command and press Enter:

```javascript
JSON.parse(localStorage.getItem('auth_token'))
```

This will show you the JWT token. Look for the `role` field in the decoded token.

## Or Check in Application Tab

1. Press **F12** to open Developer Tools
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click on **Local Storage** → **http://localhost:5173**
4. Look for `auth_token` key
5. The value is your JWT token

## To See Admin Panel

### Current Issue:
You're probably logged in as a **regular user** (john or jane), not as admin.

### Solution:
1. **Log Out** - Click "Sign Out" button in top right
2. **Log In as Admin** with these credentials:
   - Email: `admin@parkeasy.com`
   - Password: `admin123`

### After Logging in as Admin, You'll See:

#### In the Navbar:
- ✅ **ADMIN badge** next to your name
- ✅ Different menu items:
  - Dashboard (admin dashboard)
  - Users (user management)
  - Parking Lots
  - Slots (slot management)
  - Bookings
  - Analytics

#### Admin Pages Available:
- `/admin/dashboard` - Real-time statistics
- `/admin/users` - User management (CRUD)
- `/admin/slots` - Slot management (CRUD + Bulk)

---

## Visual Comparison

### Regular User Navbar:
```
ParkEase | Dashboard | Find Parking | My Bookings | [John Doe] | Sign Out
```

### Admin Navbar:
```
ParkEase | Dashboard | Users | Parking Lots | Slots | Bookings | Analytics | [Admin User] [ADMIN] | Sign Out
```

---

## Test Accounts

### Admin Account:
- **Email:** admin@parkeasy.com
- **Password:** admin123
- **Role:** admin
- **Access:** Full admin panel

### Regular User 1:
- **Email:** john@example.com
- **Password:** password123
- **Role:** user
- **Access:** User features only

### Regular User 2:
- **Email:** jane@example.com
- **Password:** password123
- **Role:** user
- **Access:** User features only

---

## Quick Test

1. **Log out** from current session
2. **Log in** with: admin@parkeasy.com / admin123
3. You should immediately see:
   - Blue "ADMIN" badge in navbar
   - Different menu items (Users, Slots, etc.)
   - Admin dashboard with statistics

---

## If You Still Don't See Admin Panel

### Check 1: Verify you're logged in as admin
Open browser console and run:
```javascript
// Check localStorage
console.log('Token:', localStorage.getItem('auth_token'));

// Or check if backend is running
fetch('http://localhost:8000/api/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
})
.then(r => r.json())
.then(data => console.log('Current user:', data));
```

### Check 2: Verify backend is running
Open: http://localhost:8000/docs
You should see FastAPI documentation

### Check 3: Clear cache and reload
1. Press **Ctrl + Shift + Delete**
2. Clear cache and cookies
3. Reload page
4. Log in again as admin

---

## Expected Behavior

### When Logged in as Admin:
✅ See "ADMIN" badge in navbar
✅ See admin menu items (Users, Slots, etc.)
✅ Can access /admin/dashboard
✅ Can access /admin/users
✅ Can access /admin/slots
✅ Can create/edit/delete users
✅ Can create/edit/delete slots

### When Logged in as Regular User:
❌ No "ADMIN" badge
❌ Different menu (Dashboard, Find Parking, My Bookings)
❌ Cannot access /admin/* routes
❌ Redirected to user dashboard

---

## Need Help?

If you're still not seeing the admin panel after logging in as admin@parkeasy.com:

1. Check browser console for errors (F12)
2. Check backend terminal for errors
3. Verify MongoDB is running: `Get-Service MongoDB`
4. Restart backend server
5. Clear browser cache completely
6. Try in incognito/private window

---

**Remember:** You MUST log in with **admin@parkeasy.com / admin123** to see admin features!