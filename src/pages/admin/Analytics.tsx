import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Calendar, Users, Activity } from 'lucide-react';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import { formatIndianCurrency } from '../../utils/indianFormat';

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    averageBookingValue: 0,
    topParkingLot: '',
    totalUsers: 0,
    bookingTrend: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get dashboard stats
      const dashboardStats = await api.getDashboardStats();
      
      // Get booking analytics for the last 30 days
      const bookingAnalytics = await api.getBookingAnalytics(30);
      
      // Calculate weekly revenue (last 7 days)
      const weeklyRevenue = bookingAnalytics
        .slice(-7)
        .reduce((sum, day) => sum + day.revenue, 0);
      
      // Calculate monthly revenue (all 30 days)
      const monthlyRevenue = bookingAnalytics
        .reduce((sum, day) => sum + day.revenue, 0);
      
      // Calculate average booking value
      const averageBookingValue = dashboardStats.total_bookings > 0
        ? dashboardStats.total_revenue / dashboardStats.total_bookings
        : 0;
      
      // Calculate booking trend (comparing last 7 days to previous 7 days)
      const lastWeekBookings = bookingAnalytics
        .slice(-7)
        .reduce((sum, day) => sum + day.bookings, 0);
      const previousWeekBookings = bookingAnalytics
        .slice(-14, -7)
        .reduce((sum, day) => sum + day.bookings, 0);
      
      const bookingTrend = previousWeekBookings > 0
        ? ((lastWeekBookings - previousWeekBookings) / previousWeekBookings) * 100
        : 0;

      setAnalytics({
        weeklyRevenue,
        monthlyRevenue,
        averageBookingValue,
        topParkingLot: 'N/A', // Would need additional endpoint
        totalUsers: dashboardStats.total_users,
        bookingTrend,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Analytics</h1>
          <p className="text-slate-600">Detailed insights and performance metrics</p>
        </motion.div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-slate-600">Loading analytics...</p>
          </Card>
        ) : (
          <>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              <motion.div variants={item}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-600">Weekly Revenue</h3>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-2">
                    {formatIndianCurrency(analytics.weeklyRevenue)}
                  </p>
                  <p className="text-sm text-slate-600">Last 7 days</p>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-600">Monthly Revenue</h3>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-2">
                    {formatIndianCurrency(analytics.monthlyRevenue)}
                  </p>
                  <p className="text-sm text-slate-600">Last 30 days</p>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-600">Avg Booking Value</h3>
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Activity className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-2">
                    {formatIndianCurrency(analytics.averageBookingValue)}
                  </p>
                  <p className="text-sm text-slate-600">Per booking</p>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-600">Total Users</h3>
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-slate-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-2">
                    {analytics.totalUsers}
                  </p>
                  <p className="text-sm text-slate-600">Registered users</p>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-600">Booking Trend</h3>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p
                    className={`text-3xl font-bold mb-2 ${
                      analytics.bookingTrend >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {analytics.bookingTrend >= 0 ? '+' : ''}
                    {analytics.bookingTrend.toFixed(1)}%
                  </p>
                  <p className="text-sm text-slate-600">vs last week</p>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-600">Top Parking Lot</h3>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-slate-900 mb-2 truncate">
                    {analytics.topParkingLot}
                  </p>
                  <p className="text-sm text-slate-600">Most popular</p>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Revenue Insights</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-slate-600">Daily Average</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ${(analytics.weeklyRevenue / 7).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Based on last 7 days</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-slate-600">Projected Monthly</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ${((analytics.weeklyRevenue / 7) * 30).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Estimated projection</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
