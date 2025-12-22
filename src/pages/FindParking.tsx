import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Clock, Car as CarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, ParkingLot } from '../lib/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import { formatIndianCurrencyWhole } from '../utils/indianFormat';

export default function FindParking() {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadParkingLots();
  }, []);

  const loadParkingLots = async () => {
    try {
      const data = await api.getParkingLots();
      // Filter active lots and sort by name
      const activeLots = data
        .filter(lot => lot.is_active)
        .sort((a, b) => a.name.localeCompare(b.name));
      setParkingLots(activeLots);
    } catch (error) {
      console.error('Error loading parking lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLots = parkingLots.filter((lot) =>
    lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lot.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBooking = (lotId: string) => {
    navigate(`/booking/${lotId}`);
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Find Parking</h1>
          <p className="text-slate-600">Discover available parking spots near you</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location or parking lot name..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-lg"
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading parking lots...</p>
          </div>
        ) : filteredLots.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Parking Lots Found</h3>
            <p className="text-slate-600">Try adjusting your search criteria</p>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredLots.map((lot, index) => (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden h-full flex flex-col">
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 relative overflow-hidden">
                    {lot.image_url ? (
                      <img
                        src={lot.image_url}
                        alt={lot.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <CarIcon className="h-20 w-20 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        lot.available_slots > 10
                          ? 'bg-green-500 text-white'
                          : lot.available_slots > 0
                          ? 'bg-yellow-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {lot.available_slots} Available
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{lot.name}</h3>
                    <div className="space-y-2 mb-4 flex-1">
                      <div className="flex items-start space-x-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{lot.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <DollarSign className="h-4 w-4 flex-shrink-0" />
                        <span className="font-semibold text-slate-900">
                          {formatIndianCurrencyWhole(lot.price_per_hour)}/hour
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>{lot.operating_hours}</span>
                      </div>
                    </div>

                    {lot.amenities && lot.amenities.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {lot.amenities.slice(0, 3).map((amenity, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-medium"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      fullWidth
                      onClick={() => handleBooking(lot.id)}
                      disabled={lot.available_slots === 0}
                    >
                      {lot.available_slots > 0 ? 'Book Now' : 'Fully Booked'}
                    </Button>
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
