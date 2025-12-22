import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { api, ParkingLot, ParkingSlot, Vehicle } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import ParkingSlotGrid from '../components/ParkingSlotGrid';
import { formatIndianCurrency, formatIndianCurrencyWhole, validateIndianVehicleNumber, formatIndianVehicleNumber, getVehicleNumberPlaceholder } from '../utils/indianFormat';

export default function Booking() {
  const { lotId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [lot, setLot] = useState<ParkingLot | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [vipSlotIds, setVipSlotIds] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadParkingData = useCallback(async () => {
    try {
      if (!lotId) {
        setError('Invalid parking lot ID');
        setLoading(false);
        return;
      }

      // Load parking lot details
      const lotData = await api.getParkingLot(lotId);
      setLot(lotData);

      // Load available slots
      const slotsData = await api.getParkingSlots(lotId);
      // Sort by slot number
      const sortedSlots = slotsData.sort((a, b) => 
        a.slot_number.localeCompare(b.slot_number, undefined, { numeric: true })
      );
      setSlots(sortedSlots);

      // Mark the first few available slots as VIP (UI only)
      const vipCandidates = sortedSlots
        .filter((slot) => slot.status === 'available')
        .slice(0, 3)
        .map((slot) => slot.id);
      setVipSlotIds(vipCandidates);

      // Load user's vehicles
      const vehiclesData = await api.getVehicles();
      setVehicles(vehiclesData);
      if (vehiclesData.length > 0) {
        setSelectedVehicle(vehiclesData[0].id);
      }
    } catch (error) {
      console.error('Error loading parking data:', error);
      setError('Failed to load parking information');
    } finally {
      setLoading(false);
    }
  }, [lotId]);

  useEffect(() => {
    loadParkingData();
  }, [loadParkingData]);

  const calculatePrice = () => {
    if (!startTime || !endTime || !lot) return 0;

    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));

    return hours > 0 ? hours * lot.price_per_hour : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSlot) {
      setError('Please select a parking slot');
      return;
    }

    if (!startTime || !endTime) {
      setError('Please fill in all fields');
      return;
    }

    // Check if we need to create a new vehicle or use existing
    let vehicleId = selectedVehicle;
    if (selectedVehicle === 'new') {
      if (!newVehiclePlate) {
        setError('Please enter vehicle registration number');
        return;
      }
      // Validate Indian vehicle number format
      if (!validateIndianVehicleNumber(newVehiclePlate)) {
        setError('Please enter a valid Indian vehicle registration number (e.g., MH-12-AB-1234)');
        return;
      }
      // We'll create the vehicle during booking
    } else if (!vehicleId) {
      setError('Please select a vehicle');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      setError('End time must be after start time');
      return;
    }

    setSubmitting(true);

    try {
      // Create new vehicle if needed
      if (selectedVehicle === 'new') {
        const formattedPlate = formatIndianVehicleNumber(newVehiclePlate);
        const newVehicle = await api.createVehicle({
          license_plate: formattedPlate,
          make: 'Unknown',
          model: 'Unknown',
          vehicle_type: 'car',
        });
        vehicleId = newVehicle.id;
      }

      // Create booking
      await api.createBooking({
        lot_id: lotId!,
        slot_id: selectedSlot,
        vehicle_id: vehicleId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });

      navigate('/my-bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Parking Lot Not Found</h2>
            <Button onClick={() => navigate('/find-parking')}>Back to Search</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{lot.name}</h1>
          <div className="flex items-center space-x-2 text-slate-600">
            <MapPin className="h-5 w-5" />
            <span>{lot.address}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">Select a Parking Slot</h2>
                  <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-600">
                    VIP Slot
                  </span>
                </div>
                <ParkingSlotGrid
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSlotSelect={setSelectedSlot}
                  vipSlotIds={vipSlotIds}
                />
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24"
            >
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Booking Details</h2>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Select Vehicle
                    </label>
                    <select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      {vehicles.length === 0 && (
                        <option value="">No vehicles found</option>
                      )}
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.license_plate} - {vehicle.make} {vehicle.model}
                        </option>
                      ))}
                      <option value="new">+ Add New Vehicle</option>
                    </select>
                  </div>

                  {selectedVehicle === 'new' && (
                    <Input
                      label="Vehicle Registration Number"
                      type="text"
                      value={newVehiclePlate}
                      onChange={(e) => setNewVehiclePlate(e.target.value)}
                      placeholder={getVehicleNumberPlaceholder()}
                      required
                    />
                  )}

                  <Input
                    label="Start Time"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />

                  <Input
                    label="End Time"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />

                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Price per hour:</span>
                      <span className="font-semibold text-slate-900">{formatIndianCurrencyWhole(lot.price_per_hour)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-slate-900">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatIndianCurrency(calculatePrice())}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    loading={submitting}
                    disabled={!selectedSlot}
                  >
                    Confirm Booking
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>{lot.operating_hours}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <DollarSign className="h-4 w-4" />
                    <span>${lot.price_per_hour}/hour</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
