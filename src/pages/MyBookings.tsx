import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Car, DollarSign, XCircle, Receipt } from 'lucide-react';
import { api, Booking } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { formatIndianCurrency } from '../utils/indianFormat';

const MyBookings = () => {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      const data = await api.getBookings();
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
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.updateBooking(bookingId, { status: 'cancelled' });
      loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const openReceiptModal = async (booking: Booking) => {
    setSelectedBooking(booking);
    setReceiptModalOpen(true);
    setReceiptError(null);

    if (!booking.id) {
      return;
    }

    try {
      setReceiptLoading(true);
      const freshBooking = await api.getBooking(booking.id);
      setSelectedBooking(freshBooking);
      setReceiptError(null);
    } catch (error) {
      console.error('Error fetching receipt:', error);
      setReceiptError('Could not load receipt details.');
    } finally {
      setReceiptLoading(false);
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

  const getReceiptStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      paid: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      refunded: 'text-slate-600 bg-slate-100',
      failed: 'text-red-600 bg-red-100',
    };
    return map[status] || 'text-slate-600 bg-slate-100';
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['active', 'confirmed', 'pending'].includes(booking.status);
    if (filter === 'completed') return booking.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Bookings</h1>
          <p className="text-slate-600">Manage your parking reservations</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-3">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All Bookings
            </Button>
            <Button
              variant={filter === 'active' ? 'primary' : 'outline'}
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'completed' ? 'primary' : 'outline'}
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
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
            <p className="text-slate-600 mb-6">
              {filter === 'all'
                ? "You haven't made any bookings yet"
                : `You don't have any ${filter} bookings`}
            </p>
            <Button onClick={() => (window.location.href = '/find-parking')}>
              Find Parking
            </Button>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-bold text-slate-900">
                            {booking.parking_lot?.name || 'Parking Lot'}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-600">
                            VIP Slot
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span>{booking.parking_lot?.address || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <Car className="h-4 w-4 flex-shrink-0" />
                            <span>Vehicle: {booking.vehicle?.license_plate || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {new Date(booking.start_time).toLocaleString()} -{' '}
                              {new Date(booking.end_time).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <DollarSign className="h-4 w-4 flex-shrink-0" />
                            <span className="font-semibold text-slate-900">
                              {formatIndianCurrency(booking.total_price)} ({booking.payment_status})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReceiptModal(booking)}
                        >
                          <Receipt className="h-4 w-4 mr-2" />
                          View Receipt
                        </Button>
                        {(booking.status === 'confirmed' || booking.status === 'pending') && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <Modal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setSelectedBooking(null);
          setReceiptError(null);
          setReceiptLoading(false);
        }}
        title="Booking Receipt"
        size="lg"
      >
        <div className="p-6 bg-slate-50">
          {receiptLoading || !selectedBooking ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg
                className="animate-spin h-8 w-8 text-blue-600 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <p className="text-slate-600">Loading receipt...</p>
            </div>
          ) : receiptError ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-semibold mb-2">{receiptError}</p>
              <p className="text-slate-600 mb-6">Please try again in a moment.</p>
              {selectedBooking && (
                <Button variant="primary" onClick={() => openReceiptModal(selectedBooking)}>
                  Retry
                </Button>
              )}
            </div>
          ) : selectedBooking && selectedBooking.receipt ? (
            <div className="space-y-6">
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{selectedBooking.receipt.parking_lot_name}</h3>
                    <p className="text-slate-600">{selectedBooking.receipt.parking_lot_address}</p>
                    {selectedBooking.receipt.parking_lot_contact && (
                      <p className="text-slate-500 text-sm">
                        Contact: {selectedBooking.receipt.parking_lot_contact}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Confirmation #</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {selectedBooking.receipt.confirmation_number}
                    </p>
                    <p className="text-sm text-slate-500">Booking ID: {selectedBooking.receipt.booking_id}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Reservation Details
                    </h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <dt className="text-slate-500">Start Time</dt>
                        <dd className="text-slate-900">
                          {new Date(selectedBooking.receipt.start_time).toLocaleString()}
                        </dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-slate-500">End Time</dt>
                        <dd className="text-slate-900">
                          {new Date(selectedBooking.receipt.end_time).toLocaleString()}
                        </dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-slate-500">Created</dt>
                        <dd className="text-slate-900">
                          {new Date(selectedBooking.receipt.created_at).toLocaleString()}
                        </dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-slate-500">Slot</dt>
                        <dd className="text-slate-900">
                          {selectedBooking.receipt.slot.slot_number}
                          {selectedBooking.receipt.slot.floor_level !== undefined &&
                            selectedBooking.receipt.slot.floor_level !== null &&
                            selectedBooking.receipt.slot.floor_level !== '' && (
                              <span className="text-slate-500">
                                {` Level ${selectedBooking.receipt.slot.floor_level}`}
                              </span>
                            )}
                        </dd>
                      </div>
                      {selectedBooking.receipt.slot.slot_type && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-slate-500">Slot Type</dt>
                          <dd className="text-slate-900">{selectedBooking.receipt.slot.slot_type}</dd>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <dt className="text-slate-500">VIP Slot</dt>
                        <dd>
                          <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-600">
                            VIP
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Vehicle & Payment
                    </h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <dt className="text-slate-500">Vehicle</dt>
                        <dd className="text-slate-900">
                          {selectedBooking.receipt.vehicle.license_plate}
                        </dd>
                      </div>
                      {selectedBooking.receipt.vehicle.make && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-slate-500">Make/Model</dt>
                          <dd className="text-slate-900">
                            {selectedBooking.receipt.vehicle.make}
                            {selectedBooking.receipt.vehicle.model && ` ${selectedBooking.receipt.vehicle.model}`}
                          </dd>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <dt className="text-slate-500">Payment Method</dt>
                        <dd className="text-slate-900">
                          {selectedBooking.receipt.payment_method}
                          {selectedBooking.receipt.payment_last4 && ` **** ${selectedBooking.receipt.payment_last4}`}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-600">Receipt details are not available for this booking yet.</p>
              <p className="text-sm text-slate-500 mt-2">
                The booking might still be processing. Try again later if you just completed this reservation.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MyBookings;
