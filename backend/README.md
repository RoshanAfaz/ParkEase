# ParkEasy Backend API

Python FastAPI backend with MongoDB for the ParkEasy parking management system.

## Features

- 🔐 **JWT Authentication** - Secure user authentication with role-based access
- 🅿️ **Parking Management** - CRUD operations for parking lots and slots
- 📅 **Booking System** - Create, update, and manage parking bookings
- 🚗 **Vehicle Management** - Users can manage multiple vehicles
- ⭐ **Reviews & Ratings** - Rate and review parking lots
- 📊 **Analytics Dashboard** - Real-time statistics and insights
- 📧 **Email Notifications** - Booking confirmations via email
- 🎫 **QR Code Generation** - QR codes for easy check-in/check-out
- 💳 **Payment Integration** - Stripe payment support (ready to integrate)
- 🗺️ **Location-based Search** - Find parking lots near you

## Tech Stack

- **FastAPI** - Modern, fast web framework
- **MongoDB** - NoSQL database with Motor (async driver)
- **JWT** - JSON Web Tokens for authentication
- **Pydantic** - Data validation
- **QRCode** - QR code generation
- **SMTP** - Email notifications

## Prerequisites

- Python 3.8+
- MongoDB (local or MongoDB Atlas)
- MongoDB Compass (optional, for GUI)

## Installation

### 1. Install MongoDB

**Windows:**
- Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- Install and start MongoDB service
- Or use MongoDB Compass with connection string: `mongodb://localhost:27017`

**Using MongoDB Atlas (Cloud):**
- Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster and get connection string

### 2. Setup Backend

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
```

### 3. Configure Environment

Create a `.env` file in the backend directory:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=parkeasy

# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@parkeasy.com

# Stripe Configuration (Optional - for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Application Configuration
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

### 4. Run the Server

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### Parking Lots
- `GET /api/parking/lots` - Get all parking lots (with location filter)
- `GET /api/parking/lots/{lot_id}` - Get specific parking lot
- `POST /api/parking/lots` - Create parking lot (Admin)
- `PUT /api/parking/lots/{lot_id}` - Update parking lot (Admin)
- `DELETE /api/parking/lots/{lot_id}` - Delete parking lot (Admin)
- `GET /api/parking/lots/{lot_id}/slots` - Get parking slots

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/all` - Get all bookings (Admin)
- `GET /api/bookings/{booking_id}` - Get specific booking
- `PUT /api/bookings/{booking_id}` - Update booking (extend/cancel)

### Vehicles
- `POST /api/vehicles` - Add new vehicle
- `GET /api/vehicles` - Get user's vehicles
- `GET /api/vehicles/{vehicle_id}` - Get specific vehicle
- `DELETE /api/vehicles/{vehicle_id}` - Delete vehicle

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/lot/{lot_id}` - Get lot reviews
- `DELETE /api/reviews/{review_id}` - Delete review

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats (Admin)
- `GET /api/analytics/bookings` - Booking analytics (Admin)
- `GET /api/analytics/user-stats` - User statistics

## Database Schema

### Collections

1. **users** - User accounts
2. **parking_lots** - Parking lot information
3. **parking_slots** - Individual parking slots
4. **bookings** - Parking reservations
5. **vehicles** - User vehicles
6. **reviews** - Parking lot reviews
7. **payments** - Payment transactions

## Testing with MongoDB Compass

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. You'll see the `parkeasy` database after first API call
4. Browse collections and documents visually

## Creating Admin User

After registering a user, you can manually set them as admin in MongoDB:

```javascript
// In MongoDB Compass or mongo shell
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Email Setup (Gmail)

1. Enable 2-Factor Authentication in Gmail
2. Generate App Password: Google Account → Security → App Passwords
3. Use the app password in `.env` file

## Development Tips

- Use `/docs` for interactive API testing
- Check logs for debugging
- MongoDB indexes are created automatically on startup
- QR codes are generated as base64 data URLs

## Production Deployment

1. Change `SECRET_KEY` to a strong random string
2. Use MongoDB Atlas for production database
3. Set up proper SMTP service (SendGrid, AWS SES, etc.)
4. Configure Stripe with production keys
5. Use environment variables for all secrets
6. Enable HTTPS
7. Set up proper logging and monitoring

## Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `net start MongoDB` (Windows)
- Check connection string in `.env`

**Import Errors:**
- Activate virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

**CORS Errors:**
- Check `FRONTEND_URL` in `.env`
- Verify CORS middleware configuration

## License

MIT License - feel free to use for your projects!