# Migration Guide: Supabase to MongoDB + Python Backend

This guide explains how to migrate from Supabase to the new MongoDB + Python FastAPI backend.

## Overview

The application has been upgraded with:
- ✅ **Python FastAPI Backend** - Modern, fast, and async
- ✅ **MongoDB Database** - Flexible NoSQL database
- ✅ **New Features** - QR codes, email notifications, reviews, analytics
- ✅ **Better Architecture** - Separation of concerns, scalable design

## What Changed

### Backend
- **From**: Supabase (PostgreSQL + Auth)
- **To**: FastAPI + MongoDB + JWT Auth

### New Features Added
1. **QR Code Generation** - Each booking gets a unique QR code
2. **Email Notifications** - Booking confirmations sent via email
3. **Vehicle Management** - Users can manage multiple vehicles
4. **Reviews & Ratings** - Rate and review parking lots
5. **Advanced Analytics** - Dashboard with real-time statistics
6. **Location-based Search** - Find parking lots near you
7. **Booking Extensions** - Extend parking time
8. **Payment Integration Ready** - Stripe integration prepared

## Migration Steps

### Step 1: Install MongoDB

**Option A: Local MongoDB**
```bash
# Download and install MongoDB Community Edition
# Windows: https://www.mongodb.com/try/download/community
# After installation, MongoDB runs on mongodb://localhost:27017
```

**Option B: MongoDB Atlas (Cloud)**
```bash
# 1. Create free account at https://www.mongodb.com/cloud/atlas
# 2. Create a cluster
# 3. Get connection string
# 4. Use in backend/.env
```

### Step 2: Setup Python Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env

# Edit .env with your settings
# At minimum, set:
# - MONGODB_URL
# - SECRET_KEY (generate a random string)
```

### Step 3: Seed Database

```bash
# Still in backend directory with venv activated
python seed_data.py
```

This creates:
- Admin user: `admin@parkeasy.com` / `admin123`
- Test users: `john@example.com` / `password123`
- Sample parking lots with slots
- Sample vehicles

### Step 4: Start Backend Server

```bash
# In backend directory
python main.py

# Or using uvicorn
uvicorn main:app --reload
```

Backend will run on: http://localhost:8000
API Docs: http://localhost:8000/docs

### Step 5: Update Frontend

```bash
# In project root directory
# Create .env file
copy .env.example .env

# Edit .env
# Set: VITE_API_URL=http://localhost:8000
```

### Step 6: Update Frontend Code

The frontend needs to be updated to use the new API client instead of Supabase.

**Replace Supabase imports with API client:**

```typescript
// Old (Supabase)
import { supabase } from '@/lib/supabase';

// New (API Client)
import { api } from '@/lib/api';
```

**Update AuthContext to use new API:**

The `AuthContext.tsx` needs to be updated to use the new API client. I'll create an updated version.

### Step 7: Start Frontend

```bash
# In project root
npm run dev
```

Frontend will run on: http://localhost:5173

## API Comparison

### Authentication

**Old (Supabase):**
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password
});
```

**New (API):**
```typescript
const user = await api.register(email, password, full_name, phone);
```

### Fetching Data

**Old (Supabase):**
```typescript
const { data, error } = await supabase
  .from('parking_lots')
  .select('*')
  .eq('is_active', true);
```

**New (API):**
```typescript
const parkingLots = await api.getParkingLots();
```

### Creating Records

**Old (Supabase):**
```typescript
const { data, error } = await supabase
  .from('bookings')
  .insert([bookingData]);
```

**New (API):**
```typescript
const booking = await api.createBooking(bookingData);
```

## Database Schema Comparison

### Users Collection (was profiles table)
```javascript
{
  _id: ObjectId,
  email: String,
  full_name: String,
  phone: String,
  password: String (hashed),
  role: "user" | "admin",
  created_at: Date,
  updated_at: Date
}
```

### Parking Lots Collection
```javascript
{
  _id: ObjectId,
  name: String,
  address: String,
  latitude: Number,
  longitude: Number,
  location: { type: "Point", coordinates: [lon, lat] }, // GeoJSON
  total_slots: Number,
  available_slots: Number,
  price_per_hour: Number,
  operating_hours: String,
  amenities: [String],
  image_url: String,
  is_active: Boolean,
  rating: Number,
  total_reviews: Number,
  created_at: Date,
  updated_at: Date
}
```

### Bookings Collection
```javascript
{
  _id: ObjectId,
  user_id: String,
  lot_id: String,
  slot_id: String,
  vehicle_id: String,
  start_time: Date,
  end_time: Date,
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled",
  total_price: Number,
  payment_status: "pending" | "paid" | "refunded" | "failed",
  qr_code: String (base64),
  created_at: Date,
  updated_at: Date
}
```

### New Collections

**Vehicles:**
```javascript
{
  _id: ObjectId,
  user_id: String,
  license_plate: String,
  make: String,
  model: String,
  color: String,
  vehicle_type: String,
  created_at: Date
}
```

**Reviews:**
```javascript
{
  _id: ObjectId,
  lot_id: String,
  user_id: String,
  user_name: String,
  rating: Number (1-5),
  comment: String,
  created_at: Date
}
```

## Testing the Migration

### 1. Test Authentication
```bash
# Register new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 2. Test Parking Lots
```bash
# Get all parking lots
curl http://localhost:8000/api/parking/lots
```

### 3. Use Interactive API Docs
Visit http://localhost:8000/docs for interactive testing

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
# Windows:
net start MongoDB

# Check connection in MongoDB Compass
# Connect to: mongodb://localhost:27017
```

### Backend Import Errors
```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

### CORS Errors
```bash
# Check backend/.env
# Ensure FRONTEND_URL=http://localhost:5173
```

### Token Issues
```bash
# Clear browser localStorage
# In browser console:
localStorage.clear()
```

## Benefits of New Architecture

1. **Better Performance** - FastAPI is one of the fastest Python frameworks
2. **More Control** - Full control over backend logic
3. **Scalability** - MongoDB scales horizontally
4. **Flexibility** - Easy to add new features
5. **Cost** - MongoDB Atlas free tier is generous
6. **Modern Stack** - Python + FastAPI + MongoDB is industry standard

## Next Steps

1. ✅ Complete frontend migration (update all components)
2. ✅ Test all features thoroughly
3. ✅ Add payment integration (Stripe)
4. ✅ Deploy backend (Railway, Render, or AWS)
5. ✅ Deploy frontend (Vercel, Netlify)
6. ✅ Set up monitoring and logging

## Support

For issues or questions:
1. Check backend logs
2. Use `/docs` endpoint for API testing
3. Check MongoDB Compass for data
4. Review this guide

## Rollback Plan

If you need to rollback to Supabase:
1. Keep the old `src/lib/supabase.ts` file
2. Revert `AuthContext.tsx` changes
3. Use git to restore previous versions
4. Supabase data remains unchanged

---

**Happy Coding! 🚀**