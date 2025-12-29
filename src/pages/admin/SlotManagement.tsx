import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Plus, Edit, Trash2, Grid, List } from 'lucide-react';
import { api, ParkingLot, ParkingSlot } from '../../lib/api';
import Card from '../../components/Card';
import Navbar from '../../components/Navbar';

export default function SlotManagement() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<string>('');
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [formData, setFormData] = useState({
    slot_number: '',
    slot_type: 'regular',
    status: 'available',
    floor_level: 1,
  });

  const [bulkFormData, setBulkFormData] = useState({
    start_number: 1,
    count: 10,
    slot_type: 'regular',
    floor_level: 1,
  });

  useEffect(() => {
    loadLots();
  }, []);

  useEffect(() => {
    if (selectedLot) {
      loadSlots();
    }
  }, [selectedLot, statusFilter]);

  const loadLots = async () => {
    try {
      const data = await api.getParkingLots();
      setLots(data);
      if (data.length > 0 && !selectedLot) {
        setSelectedLot(data[0].id);
      }
    } catch (error) {
      console.error('Error loading parking lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    if (!selectedLot) return;

    try {
      const data = await api.getParkingSlots(selectedLot, statusFilter || undefined);
      setSlots(data);
    } catch (error) {
      console.error('Error loading slots:', error);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;

    try {
      await api.createParkingSlot(selectedLot, formData);
      setShowAddModal(false);
      setFormData({ slot_number: '', slot_type: 'regular', status: 'available', floor_level: 1 });
      loadSlots();
      loadLots(); // Refresh lot counts
    } catch (error: any) {
      alert(error.message || 'Failed to create slot');
    }
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;

    try {
      const result = await api.createBulkParkingSlots(selectedLot, bulkFormData);
      alert(`Created ${result.created_count} slots. ${result.skipped_count} skipped (already exist).`);
      setShowBulkModal(false);
      setBulkFormData({ start_number: 1, count: 10, slot_type: 'regular', floor_level: 1 });
      loadSlots();
      loadLots(); // Refresh lot counts
    } catch (error: any) {
      alert(error.message || 'Failed to create slots');
    }
  };

  const handleEditSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    try {
      await api.updateParkingSlot(selectedSlot.id, {
        slot_type: formData.slot_type,
        status: formData.status,
        floor_level: formData.floor_level,
      });
      setShowEditModal(false);
      setSelectedSlot(null);
      setFormData({ slot_number: '', slot_type: 'regular', status: 'available', floor_level: 1 });
      loadSlots();
      loadLots(); // Refresh lot counts
    } catch (error: any) {
      alert(error.message || 'Failed to update slot');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) {
      return;
    }

    try {
      await api.deleteParkingSlot(slotId);
      loadSlots();
      loadLots(); // Refresh lot counts
    } catch (error: any) {
      alert(error.message || 'Failed to delete slot');
    }
  };

  const openEditModal = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setFormData({
      slot_number: slot.slot_number,
      slot_type: slot.slot_type,
      status: slot.status,
      floor_level: slot.floor_level,
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'maintenance':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'disabled':
        return '♿';
      case 'electric':
        return '⚡';
      case 'compact':
        return '🚗';
      default:
        return '🅿️';
    }
  };

  const selectedLotData = lots.find((lot) => lot.id === selectedLot);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Car className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-slate-900">Slot Management</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowBulkModal(true)}
                disabled={!selectedLot}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Grid className="h-5 w-5" />
                <span>Bulk Add</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={!selectedLot}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5" />
                <span>Add Slot</span>
              </button>
            </div>
          </div>
          <p className="text-slate-600">Manage parking slots for each lot</p>
        </motion.div>

        {/* Lot Selection and Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Parking Lot
              </label>
              <select
                value={selectedLot}
                onChange={(e) => setSelectedLot(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.name} ({lot.available_slots}/{lot.total_slots} available)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">View Mode</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                >
                  <Grid className="h-4 w-4" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                >
                  <List className="h-4 w-4" />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>

          {selectedLotData && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-slate-600">Total Slots</p>
                  <p className="text-2xl font-bold text-slate-900">{selectedLotData.total_slots}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Available</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedLotData.available_slots}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Occupied</p>
                  <p className="text-2xl font-bold text-red-600">
                    {selectedLotData.total_slots - selectedLotData.available_slots}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedLotData.total_slots > 0
                      ? Math.round(
                        ((selectedLotData.total_slots - selectedLotData.available_slots) /
                          selectedLotData.total_slots) *
                        100
                      )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Slots Display */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading slots...</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {slots.map((slot) => (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative"
              >
                <Card
                  className={`p-4 border-2 ${getStatusColor(
                    slot.status
                  )} hover:shadow-lg transition-all cursor-pointer`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{getTypeIcon(slot.slot_type)}</div>
                    <p className="font-bold text-lg text-slate-900">{slot.slot_number}</p>
                    <p className="text-xs text-slate-600 capitalize mt-1">{slot.status}</p>
                    <p className="text-xs text-slate-500">Floor {slot.floor_level}</p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button
                      onClick={() => openEditModal(slot)}
                      className="p-1 bg-white rounded shadow hover:bg-blue-50 text-blue-600"
                      title="Edit"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-1 bg-white rounded shadow hover:bg-red-50 text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Slot Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Floor
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {slots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getTypeIcon(slot.slot_type)}</span>
                          <span className="font-semibold text-slate-900">{slot.slot_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="capitalize text-slate-600">{slot.slot_type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                            slot.status
                          )}`}
                        >
                          {slot.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        Floor {slot.floor_level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(slot)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {slots.length === 0 && !loading && (
          <Card className="p-12 text-center">
            <Car className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No slots found</p>
            <p className="text-slate-500 text-sm mt-2">
              {selectedLot ? 'Add slots to get started' : 'Select a parking lot first'}
            </p>
          </Card>
        )}

        {/* Add Slot Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Plus className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-900">Add Parking Slot</h2>
              </div>
              <form onSubmit={handleAddSlot} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Slot Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., A001"
                    value={formData.slot_number}
                    onChange={(e) => setFormData({ ...formData, slot_number: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Slot Type
                  </label>
                  <select
                    value={formData.slot_type}
                    onChange={(e) => setFormData({ ...formData, slot_type: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="regular">Regular</option>
                    <option value="compact">Compact</option>
                    <option value="disabled">Disabled</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Floor Level
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.floor_level}
                    onChange={(e) =>
                      setFormData({ ...formData, floor_level: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Create Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        slot_number: '',
                        slot_type: 'regular',
                        status: 'available',
                        floor_level: 1,
                      });
                    }}
                    className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Bulk Add Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Grid className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-bold text-slate-900">Bulk Add Slots</h2>
              </div>
              <form onSubmit={handleBulkAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Starting Number
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={bulkFormData.start_number}
                    onChange={(e) =>
                      setBulkFormData({ ...bulkFormData, start_number: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Slots will be numbered as A001, A002, etc.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Number of Slots
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={bulkFormData.count}
                    onChange={(e) =>
                      setBulkFormData({ ...bulkFormData, count: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Slot Type
                  </label>
                  <select
                    value={bulkFormData.slot_type}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, slot_type: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="regular">Regular</option>
                    <option value="compact">Compact</option>
                    <option value="disabled">Disabled</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Floor Level
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={bulkFormData.floor_level}
                    onChange={(e) =>
                      setBulkFormData({ ...bulkFormData, floor_level: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Create Slots
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkModal(false);
                      setBulkFormData({
                        start_number: 1,
                        count: 10,
                        slot_type: 'regular',
                        floor_level: 1,
                      });
                    }}
                    className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Slot Modal */}
        {showEditModal && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Edit className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-bold text-slate-900">Edit Slot {selectedSlot.slot_number}</h2>
              </div>
              <form onSubmit={handleEditSlot} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Slot Type
                  </label>
                  <select
                    value={formData.slot_type}
                    onChange={(e) => setFormData({ ...formData, slot_type: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="regular">Regular</option>
                    <option value="compact">Compact</option>
                    <option value="disabled">Disabled</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Floor Level
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.floor_level}
                    onChange={(e) =>
                      setFormData({ ...formData, floor_level: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Update Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedSlot(null);
                      setFormData({
                        slot_number: '',
                        slot_type: 'regular',
                        status: 'available',
                        floor_level: 1,
                      });
                    }}
                    className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}