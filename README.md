# 🅿️ ParkEasy - Smart Parking Management System

A modern, full-stack parking management application with real-time availability tracking, booking system, QR code generation, and comprehensive analytics.

![Tech Stack](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)
![Python](https://img.shields.io/badge/Python-3.8+-yellow)

## 🌟 Features

### For Users
- 🔐 **Secure Authentication** - JWT-based authentication with role management
- 🗺️ **Location-Based Search** - Find parking lots near you
- 📅 **Easy Booking** - Book parking slots in advance
- 🚗 **Vehicle Management** - Manage multiple vehicles
- 🎫 **QR Code Check-in** - Unique QR codes for each booking
- 📧 **Email Notifications** - Booking confirmations via email
- ⭐ **Reviews & Ratings** - Rate and review parking lots
- 📊 **Personal Dashboard** - Track your bookings and spending
- ⏰ **Booking Extensions** - Extend your parking time
- 💳 **Payment Ready** - Stripe integration prepared

### For Admins
- 📈 **Analytics Dashboard** - Real-time statistics and insights
- 🅿️ **Parking Lot Management** - Full CRUD operations
- 🎯 **Slot Management** - Manage individual parking slots
- 📋 **Booking Management** - View and manage all bookings
- 💰 **Revenue Tracking** - Monitor earnings and trends
- 👥 **User Management** - View user statistics
- 📊 **Occupancy Tracking** - Real-time occupancy rates

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **JWT** - Secure authentication
- **QRCode** - QR code generation
- **SMTP** - Email notifications
- **Stripe** - Payment processing (ready)

## 📁 Project Structure

```
parkeasy/
├── backend/                 # Python FastAPI backend
│   ├── routers/            # API route handlers
│   │   ├── auth_router.py
│   │   ├── parking_router.py
│   │   ├── booking_router.py
│   │   ├── vehicle_router.py
│   │   ├── review_router.py
│   │   └── analytics_router.py
│   ├── main.py             # FastAPI application
│   ├── config.py           # Configuration settings
│   ├── database.py         # MongoDB connection
│   ├── models.py           # Pydantic models
│   ├── auth.py             # Authentication utilities
│   ├── utils.py            # Helper functions
│   ├── seed_data.py        # Database seeder
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment template
│
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── contexts/           # React contexts
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin pages
│   │   ├── Landing.tsx
│   │   ├── FindParking.tsx
│   │   ├── Booking.tsx
│   │   ├── Dashboard.tsx
│   │   └── MyBookings.tsx
│   ├── lib/                # Utilities
│   │   ├── api.ts          # API client
│   │   └── supabase.ts     # (Legacy)
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
│
├── setup_backend.bat       # Backend setup script
├── start_backend.bat       # Start backend server
├── start_frontend.bat      # Start frontend server
├── start_all.bat           # Start both servers
├── SETUP_INSTRUCTIONS.md   # Detailed setup guide
├── MIGRATION_GUIDE.md      # Migration documentation
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB (local or Atlas)

### Option 1: Automated Setup (Windows)

```powershell
# 1. Setup backend
.\setup_backend.bat

# 2. Edit backend\.env with your MongoDB URL

# 3. Seed database
cd backend
.\venv\Scripts\activate
python seed_data.py

# 4. Start both servers
.\start_all.bat
```

### Option 2: Manual Setup

**Backend:**
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

**Frontend:**
```powershell
npm install
copy .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Test Accounts

After seeding:
- **Admin**: admin@parkeasy.com / admin123
- **User**: john@example.com / password123

## 📖 Documentation

- **[Setup Instructions](SETUP_INSTRUCTIONS.md)** - Detailed setup guide
- **[Migration Guide](MIGRATION_GUIDE.md)** - Supabase to MongoDB migration
- **[Backend README](backend/README.md)** - Backend API documentation
- **[API Docs](http://localhost:8000/docs)** - Interactive API documentation

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile

### Parking
- `GET /api/parking/lots` - List parking lots
- `GET /api/parking/lots/{id}` - Get parking lot
- `POST /api/parking/lots` - Create parking lot (Admin)
- `PUT /api/parking/lots/{id}` - Update parking lot (Admin)
- `DELETE /api/parking/lots/{id}` - Delete parking lot (Admin)
- `GET /api/parking/lots/{id}/slots` - Get parking slots

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/all` - Get all bookings (Admin)
- `GET /api/bookings/{id}` - Get booking details
- `PUT /api/bookings/{id}` - Update booking

### Vehicles
- `POST /api/vehicles` - Add vehicle
- `GET /api/vehicles` - List user vehicles
- `GET /api/vehicles/{id}` - Get vehicle
- `DELETE /api/vehicles/{id}` - Delete vehicle

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/lot/{id}` - Get lot reviews
- `DELETE /api/reviews/{id}` - Delete review

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats (Admin)
- `GET /api/analytics/bookings` - Booking analytics (Admin)
- `GET /api/analytics/user-stats` - User statistics

## 🗄️ Database Schema

### Collections

**users**
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

**parking_lots**
```javascript
{
  _id: ObjectId,
  name: String,
  address: String,
  latitude: Number,
  longitude: Number,
  location: GeoJSON,
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

**bookings**
```javascript
{
  _id: ObjectId,
  user_id: String,
  lot_id: String,
  slot_id: String,
  vehicle_id: String,
  start_time: Date,
  end_time: Date,
  status: String,
  total_price: Number,
  payment_status: String,
  qr_code: String,
  created_at: Date,
  updated_at: Date
}
```

**vehicles**
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

**reviews**
```javascript
{
  _id: ObjectId,
  lot_id: String,
  user_id: String,
  user_name: String,
  rating: Number,
  comment: String,
  created_at: Date
}
```

## 🧪 Testing

### Backend Testing
```powershell
# Interactive API docs
# Open: http://localhost:8000/docs

# Or use curl
curl http://localhost:8000/health
```

### Frontend Testing
```powershell
npm run typecheck  # Type checking
npm run lint       # Linting
npm run build      # Production build
```

## 🔧 Configuration

### Backend (.env)
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=parkeasy
SECRET_KEY=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
STRIPE_SECRET_KEY=sk_test_...
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 📦 Deployment

### Backend
- **Railway**: Connect GitHub repo, auto-deploy
- **Render**: Free tier available
- **AWS**: EC2 or Elastic Beanstalk
- **Heroku**: Easy deployment

### Frontend
- **Vercel**: Automatic React deployment
- **Netlify**: Free tier with CI/CD
- **GitHub Pages**: Static hosting

### Database
- **MongoDB Atlas**: Free tier (512MB)
- **MongoDB Cloud**: Managed service

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- FastAPI for the amazing framework
- MongoDB for the flexible database
- React team for the UI library
- Tailwind CSS for the styling system
- All open-source contributors

## 📞 Support

For issues or questions:
1. Check [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
2. Review [API Documentation](http://localhost:8000/docs)
3. Check MongoDB Compass for data
4. Review error logs

## 🗺️ Roadmap

- [ ] Real-time updates with WebSockets
- [ ] Mobile app (React Native)
- [ ] Payment integration (Stripe)
- [ ] Advanced analytics
- [ ] Automated pricing
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Push notifications
- [ ] Integration with Google Maps
- [ ] Parking spot recommendations using AI

## 📸 Screenshots

### User Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=User+Dashboard)

### Admin Analytics
![Analytics](https://via.placeholder.com/800x400?text=Admin+Analytics)

### Booking Flow
![Booking](https://via.placeholder.com/800x400?text=Booking+Flow)

---

**Built with ❤️ by the ParkEasy Team**

⭐ Star this repo if you find it helpful!