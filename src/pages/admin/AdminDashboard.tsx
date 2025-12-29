import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign, TrendingUp, Users, Car, Activity, RefreshCw } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../lib/api';
import Card from '../../components/Card';
import Navbar from '../../components/Navbar';
import { formatIndianCurrency } from '../../utils/indianFormat';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'7d' | '30d' | '1y'>('7d');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [range]);

  const loadData = async () => {
    try {
      const [realtimeStats, analyticsData] = await Promise.all([
        api.getRealtimeStats(),
        api.getAnalytics(range)
      ]);
      setStats(realtimeStats);
      setAnalytics(analyticsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading stats:', error);
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                ADMIN
              </span>
              <span className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                <Activity className="h-3 w-3 animate-pulse" />
                <span>LIVE</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as any)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <button
                onClick={loadData}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-slate-600">Real-time overview of parking system metrics</p>
            <span className="text-xs text-slate-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading statistics...</p>
          </div>
        ) : !stats ? (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load dashboard data.</p>
            <button
              onClick={loadData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <motion.div variants={item}>
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">Total Users</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.users.total}</p>
                      <p className="text-xs text-green-600 mt-1">+{stats.users.new_today} today</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">Parking Lots</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.parking_lots.total}</p>
                      <p className="text-xs text-slate-600 mt-1">{stats.parking_lots.active} active</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <MapPin className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">Parking Slots</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {stats.slots.available}/{stats.slots.total}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">{stats.slots.occupancy_rate}% occupied</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-xl">
                      <Car className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">Active Bookings</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.bookings.active}</p>
                      <p className="text-xs text-blue-600 mt-1">{stats.bookings.today} today</p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-xl">
                      <Calendar className="h-8 w-8 text-yellow-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>

            {/* Analytics Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue Analytics</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(str) => {
                          const date = new Date(str);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(val) => `₹${val}`}
                      />
                      <Tooltip
                        formatter={(value: any) => [formatIndianCurrency(value), 'Revenue']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Bookings Overview</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(str) => {
                          const date = new Date(str);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      />
                      <Bar dataKey="bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Total Revenue</h3>
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-slate-900 mb-2">
                  {formatIndianCurrency(stats.revenue.total)}
                </p>
                <p className="text-sm text-slate-600">All time earnings</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Today's Revenue</h3>
                  <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-slate-900 mb-2">
                  {formatIndianCurrency(stats.revenue.today)}
                </p>
                <p className="text-sm text-slate-600">Revenue generated today</p>
              </Card>
            </motion.div>

            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6"
            >
              <Card className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Activities</h3>
                <div className="space-y-3">
                  {stats.recent_activities.slice(0, 5).map((activity: any) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {activity.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{activity.user_name}</p>
                          <p className="text-sm text-slate-600">{activity.lot_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {formatIndianCurrency(activity.total_price)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(activity.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
