// This file is kept for backward compatibility with type exports only
// The actual API client is now in api.ts using MongoDB backend

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
};

export type ParkingLot = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  total_slots: number;
  available_slots: number;
  price_per_hour: number;
  operating_hours: string;
  amenities: string[];
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ParkingSlot = {
  id: string;
  lot_id: string;
  slot_number: string;
  slot_type: 'regular' | 'disabled' | 'electric' | 'compact';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  floor_level: number;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  user_id: string;
  lot_id: string;
  slot_id: string;
  vehicle_number: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  total_price: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
};

// Note: Use the api client from './api' for all API calls
// This file only exports types for backward compatibility
