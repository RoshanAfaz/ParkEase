import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, TrendingUp, Car as CarIcon, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api, Booking } from '../lib/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import { formatIndianCurrency } from '../utils/indianFormat';

export default function Dashboard() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      // Load user stats from analytics endpoint
      const userStats = await api.getUserStats();
      
      setStats({
        activeBookings: userStats.active_bookings,
        completedBookings: userStats.total_bookings - userStats.active_bookings,
        totalSpent: userStats.total_spent,
      });

      // Load recent bookings
      const bookingsData = await api.getBookings();
      
      // Sort by created_at and take first 5
      const sortedBookings = bookingsData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 5);
      
      setBookings(sortedBookings);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      confirmed: 'bg-blue-100 text-blue-700',
      completed: 'bg-slate-100 text-slate-700',
      cancelled: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-slate-600">Here's your parking overview</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={item}>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Active Bookings</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.activeBookings}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <CarIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.completedBookings}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Total Spent</p>
                  <p className="text-3xl font-bold text-slate-900">{formatIndianCurrency(stats.totalSpent)}</p>
                </div>
                <div className="bg-slate-100 p-3 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-slate-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link to="/find-parking">
              <Card className="p-6 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-xl shadow-lg">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Find Parking</h3>
                    <p className="text-slate-600">Search for available parking spots near you</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/my-bookings">
              <Card className="p-6 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-xl shadow-lg">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">My Bookings</h3>
                    <p className="text-slate-600">View and manage your reservations</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Recent Bookings</h2>
            <Link to="/my-bookings">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-slate-600">Loading bookings...</p>
            </Card>
          ) : bookings.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">No bookings yet</p>
              <Link to="/find-parking">
                <Button>Find Parking</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          Booking #{booking.id.slice(0, 8)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <CarIcon className="h-4 w-4" />
                          <span>{booking.vehicle?.license_plate || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(booking.start_time).toLocaleDateString()}</span>
                        </div>
                        {booking.parking_lot && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{booking.parking_lot.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{formatIndianCurrency(booking.total_price)}</p>
                      <p className="text-sm text-slate-600">{booking.payment_status}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
