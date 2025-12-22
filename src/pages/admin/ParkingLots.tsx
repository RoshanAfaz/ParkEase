import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, DollarSign, Edit, Trash2 } from 'lucide-react';
import { api, ParkingLot } from '../../lib/api';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { formatIndianCurrencyWhole } from '../../utils/indianFormat';

export default function ParkingLots() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<ParkingLot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    total_slots: '',
    price_per_hour: '',
    operating_hours: '24/7',
    amenities: '',
  });

  useEffect(() => {
    loadLots();
  }, []);

  const loadLots = async () => {
    try {
      const data = await api.getParkingLots();
      const sortedLots = data.sort((a, b) => a.name.localeCompare(b.name));
      setLots(sortedLots);
    } catch (error) {
      console.error('Error loading parking lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (lot?: ParkingLot) => {
    if (lot) {
      setEditingLot(lot);
      setFormData({
        name: lot.name,
        address: lot.address,
        latitude: lot.latitude.toString(),
        longitude: lot.longitude.toString(),
        total_slots: lot.total_slots.toString(),
        price_per_hour: lot.price_per_hour.toString(),
        operating_hours: lot.operating_hours,
        amenities: lot.amenities?.join(', ') || '',
      });
    } else {
      setEditingLot(null);
      setFormData({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        total_slots: '',
        price_per_hour: '',
        operating_hours: '24/7',
        amenities: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amenitiesArray = formData.amenities
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a);

    const lotData = {
      name: formData.name,
      address: formData.address,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      total_slots: parseInt(formData.total_slots),
      available_slots: editingLot ? editingLot.available_slots : parseInt(formData.total_slots),
      price_per_hour: parseFloat(formData.price_per_hour),
      operating_hours: formData.operating_hours,
      amenities: amenitiesArray,
    };

    try {
      if (editingLot) {
        await api.updateParkingLot(editingLot.id, lotData);
      } else {
        await api.createParkingLot(lotData);
      }

      setIsModalOpen(false);
      loadLots();
    } catch (error) {
      console.error('Error saving parking lot:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this parking lot?')) return;

    try {
      await api.deleteParkingLot(id);
      loadLots();
    } catch (error) {
      console.error('Error deleting parking lot:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Parking Lots</h1>
            <p className="text-slate-600">Manage parking lot locations</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-5 w-5 mr-2" />
            Add Parking Lot
          </Button>
        </motion.div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-slate-600">Loading parking lots...</p>
          </Card>
        ) : lots.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No parking lots yet</h3>
            <p className="text-slate-600 mb-6">Create your first parking lot to get started</p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-5 w-5 mr-2" />
              Add Parking Lot
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lots.map((lot, index) => (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{lot.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        lot.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {lot.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

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
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Total Slots:</span>
                        <span className="font-bold text-slate-900">{lot.total_slots}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Available:</span>
                        <span className="font-bold text-green-600">{lot.available_slots}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4 border-t border-slate-200">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => handleOpenModal(lot)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      fullWidth
                      onClick={() => handleDelete(lot.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLot ? 'Edit Parking Lot' : 'Add Parking Lot'}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              required
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Slots"
              type="number"
              value={formData.total_slots}
              onChange={(e) => setFormData({ ...formData, total_slots: e.target.value })}
              required
            />
            <Input
              label="Price per Hour (₹)"
              type="number"
              step="0.01"
              value={formData.price_per_hour}
              onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
              required
            />
          </div>
          <Input
            label="Operating Hours"
            value={formData.operating_hours}
            onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
            required
          />
          <Input
            label="Amenities (comma separated)"
            value={formData.amenities}
            onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
            placeholder="CCTV, Security, EV Charging"
          />
          <div className="flex space-x-3 pt-4">
            <Button type="submit" fullWidth>
              {editingLot ? 'Update' : 'Create'} Parking Lot
            </Button>
            <Button type="button" variant="outline" fullWidth onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
