import { motion } from 'framer-motion';
import { Car, Zap, Users } from 'lucide-react';
import { ParkingSlot } from '../lib/api';

interface ParkingSlotGridProps {
  slots: ParkingSlot[];
  selectedSlot: string | null;
  onSlotSelect: (slotId: string) => void;
  vipSlotIds?: string[];
}

export default function ParkingSlotGrid({ slots, selectedSlot, onSlotSelect, vipSlotIds = [] }: ParkingSlotGridProps) {
  const getSlotIcon = (type: string) => {
    switch (type) {
      case 'electric':
        return <Zap className="h-4 w-4" />;
      case 'disabled':
        return <Users className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  const getSlotColor = (status: string, isSelected: boolean, isVip: boolean) => {
    if (isSelected) {
      return 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/50';
    }

    if (isVip && status === 'available') {
      return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300 hover:shadow-md';
    }

    switch (status) {
      case 'available':
        return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300 hover:shadow-md';
      case 'occupied':
        return 'bg-red-50 text-red-700 border-red-200 cursor-not-allowed opacity-60';
      case 'reserved':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 cursor-not-allowed opacity-60';
      case 'maintenance':
        return 'bg-slate-50 text-slate-700 border-slate-200 cursor-not-allowed opacity-60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    const floor = slot.floor_level;
    if (!acc[floor]) {
      acc[floor] = [];
    }
    acc[floor].push(slot);
    return acc;
  }, {} as Record<number, ParkingSlot[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedSlots)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([floor, floorSlots]) => (
          <div key={floor}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Floor {floor}
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {floorSlots.map((slot, index) => {
                const isSelected = selectedSlot === slot.id;
                const isAvailable = slot.status === 'available';

                return (
                  <motion.button
                    key={slot.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={isAvailable ? { scale: 1.05 } : {}}
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                    onClick={() => isAvailable && onSlotSelect(slot.id)}
                    disabled={!isAvailable}
                    className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${getSlotColor(
                      slot.status,
                      isSelected,
                      vipSlotIds.includes(slot.id)
                    )}`}
                  >
                    {getSlotIcon(slot.slot_type)}
                    <span className="text-xs font-bold mt-1">{slot.slot_number}</span>
                    {vipSlotIds.includes(slot.id) && (
                      <span className="mt-1 inline-flex items-center rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-600">
                        VIP
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}

      <div className="mt-6 p-4 bg-slate-50 rounded-xl">
        <h4 className="text-sm font-bold text-slate-900 mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-50 border-2 border-green-200 rounded-lg"></div>
            <span className="text-sm text-slate-700">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-50 border-2 border-red-200 rounded-lg"></div>
            <span className="text-sm text-slate-700">Occupied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 border-2 border-blue-600 rounded-lg"></div>
            <span className="text-sm text-slate-700">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-50 border-2 border-purple-200 rounded-lg"></div>
            <span className="text-sm text-slate-700">VIP</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="flex items-center space-x-2">
            <Car className="h-4 w-4 text-slate-600" />
            <span className="text-sm text-slate-700">Regular</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-slate-600" />
            <span className="text-sm text-slate-700">Electric</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-slate-600" />
            <span className="text-sm text-slate-700">Disabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
