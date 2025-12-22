import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Car, DollarSign, Filter } from 'lucide-react';
import { api, Booking } from '../../lib/api';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { formatIndianCurrency } from '../../utils/indianFormat';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await api.getAllBookings();
      // Sort by created_at descending
      const sortedBookings = data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setBookings(sortedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700 border-green-200',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-slate-100 text-slate-700 border-slate-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['active', 'confirmed', 'pending'].includes(booking.status);
    return booking.status === filter;
  });

  const totalRevenue = bookings
    .filter((b) => b.payment_status === 'paid')
    .reduce((sum, b) => sum + b.total_price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">All Bookings</h1>
          <p className="text-slate-600">Manage all parking reservations</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6">
            <p className="text-sm font-semibold text-slate-600 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-slate-900">{bookings.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-semibold text-slate-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-600">
              {bookings.filter((b) => ['active', 'confirmed'].includes(b.status)).length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-semibold text-slate-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-slate-600">
              {bookings.filter((b) => b.status === 'completed').length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-semibold text-slate-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-600">{formatIndianCurrency(totalRevenue)}</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-slate-600" />
            <div className="flex flex-wrap gap-3">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'active' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={filter === 'completed' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Completed
              </Button>
              <Button
                variant={filter === 'cancelled' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('cancelled')}
              >
                Cancelled
              </Button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-slate-600">Loading bookings...</p>
          </Card>
        ) : filteredBookings.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
            <p className="text-slate-600">No bookings match the selected filter</p>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-bold text-slate-900">
                          {booking.parking_lot?.name || 'Parking Lot'}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>{booking.parking_lot?.address || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Car className="h-4 w-4 flex-shrink-0" />
                          <span>{booking.vehicle?.license_plate || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <DollarSign className="h-4 w-4 flex-shrink-0" />
                          <span className="font-semibold text-slate-900">
                            {formatIndianCurrency(booking.total_price)}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">User ID:</span> {booking.user_id.slice(0, 8)}...
                        </div>
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">Booking ID:</span> {booking.id.slice(0, 8)}...
                        </div>
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">Payment:</span>{' '}
                          <span
                            className={
                              booking.payment_status === 'paid'
                                ? 'text-green-600 font-semibold'
                                : 'text-yellow-600 font-semibold'
                            }
                          >
                            {booking.payment_status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 text-sm text-slate-600">
                        <div className="flex items-center space-x-4">
                          <span>
                            <span className="font-semibold">Start:</span>{' '}
                            {new Date(booking.start_time).toLocaleString()}
                          </span>
                          <span>
                            <span className="font-semibold">End:</span>{' '}
                            {new Date(booking.end_time).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
