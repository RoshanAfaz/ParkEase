/**
 * API client for ParkEasy backend
 * Replaces Supabase with FastAPI + MongoDB backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface ParkingLot {
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
  image_url?: string;
  is_active: boolean;
  rating?: number;
  total_reviews: number;
  created_at: string;
}

export interface ParkingSlot {
  id: string;
  lot_id: string;
  slot_number: string;
  slot_type: 'regular' | 'disabled' | 'electric' | 'compact';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  floor_level: number;
  created_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  license_plate: string;
  make: string;
  model: string;
  color?: string;
  vehicle_type: string;
  created_at: string;
}

export interface ReceiptSlotInfo {
  slot_number: string;
  floor_level?: number;
  slot_type?: string;
}

export interface ReceiptVehicleInfo {
  license_plate: string;
  make?: string;
  model?: string;
  color?: string;
  vehicle_type?: string;
}

export interface BookingReceipt {
  booking_id: string;
  confirmation_number: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  parking_lot_name: string;
  parking_lot_address: string;
  parking_lot_contact?: string;
  slot: ReceiptSlotInfo;
  vehicle: ReceiptVehicleInfo;
  start_time: string;
  end_time: string;
  booking_status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  total_price: number;
  created_at: string;
  qr_code?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  lot_id: string;
  slot_id: string;
  vehicle_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  total_price: number;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  qr_code?: string;
  created_at: string;
  updated_at: string;
  parking_lot?: ParkingLot;
  vehicle?: Vehicle;
  receipt?: BookingReceipt;
}

export interface Review {
  id: string;
  lot_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

// API Client Class
class APIClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth endpoints
  async register(email: string, password: string, full_name: string, phone?: string) {
    const user = await this.request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name, phone }),
    });
    return user;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ access_token: string; token_type: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    this.setToken(response.access_token);
    return response;
  }

  async getCurrentUser() {
    return this.request<User>('/api/auth/me');
  }

  async updateProfile(data: { full_name?: string; phone?: string }) {
    return this.request<User>('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  logout() {
    this.clearToken();
  }

  // Parking lot endpoints
  async getParkingLots(params?: {
    latitude?: number;
    longitude?: number;
    max_distance?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.latitude) query.append('latitude', params.latitude.toString());
    if (params?.longitude) query.append('longitude', params.longitude.toString());
    if (params?.max_distance) query.append('max_distance', params.max_distance.toString());

    return this.request<ParkingLot[]>(`/api/parking/lots?${query}`);
  }

  async getParkingLot(id: string) {
    return this.request<ParkingLot>(`/api/parking/lots/${id}`);
  }

  async createParkingLot(data: Partial<ParkingLot>) {
    return this.request<ParkingLot>('/api/parking/lots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateParkingLot(id: string, data: Partial<ParkingLot>) {
    return this.request<ParkingLot>(`/api/parking/lots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteParkingLot(id: string) {
    return this.request(`/api/parking/lots/${id}`, {
      method: 'DELETE',
    });
  }

  async getParkingSlots(lotId: string, status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<ParkingSlot[]>(`/api/parking/lots/${lotId}/slots${query}`);
  }

  // Booking endpoints
  async createBooking(data: {
    lot_id: string;
    slot_id: string;
    vehicle_id: string;
    start_time: string;
    end_time: string;
  }) {
    return this.request<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookings(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<Booking[]>(`/api/bookings${query}`);
  }

  async getAllBookings(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<Booking[]>(`/api/bookings/all${query}`);
  }

  async getBooking(id: string) {
    return this.request<Booking>(`/api/bookings/${id}`);
  }

  async updateBooking(id: string, data: { end_time?: string; status?: string }) {
    return this.request<Booking>(`/api/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Vehicle endpoints
  async createVehicle(data: {
    license_plate: string;
    make: string;
    model: string;
    color?: string;
    vehicle_type?: string;
  }) {
    return this.request<Vehicle>('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVehicles() {
    return this.request<Vehicle[]>('/api/vehicles');
  }

  async getVehicle(id: string) {
    return this.request<Vehicle>(`/api/vehicles/${id}`);
  }

  async deleteVehicle(id: string) {
    return this.request(`/api/vehicles/${id}`, {
      method: 'DELETE',
    });
  }

  // Review endpoints
  async createReview(data: { lot_id: string; rating: number; comment?: string }) {
    return this.request<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLotReviews(lotId: string) {
    return this.request<Review[]>(`/api/reviews/lot/${lotId}`);
  }

  async deleteReview(id: string) {
    return this.request(`/api/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async getDashboardStats() {
    return this.request<{
      total_bookings: number;
      active_bookings: number;
      total_revenue: number;
      total_parking_lots: number;
      total_users: number;
      occupancy_rate: number;
    }>('/api/analytics/dashboard');
  }

  async getBookingAnalytics(days: number = 30) {
    return this.request<Array<{ date: string; bookings: number; revenue: number }>>(
      `/api/analytics/bookings?days=${days}`
    );
  }

  async getUserStats() {
    return this.request<{
      total_bookings: number;
      active_bookings: number;
      total_spent: number;
      favorite_parking_lot?: {
        id: string;
        name: string;
        address: string;
      };
    }>('/api/analytics/user-stats');
  }

  // Admin endpoints
  async getAllUsers(params?: { skip?: number; limit?: number; role?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.skip) query.append('skip', params.skip.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.role) query.append('role', params.role);
    if (params?.search) query.append('search', params.search);

    return this.request<{
      users: User[];
      total: number;
      skip: number;
      limit: number;
    }>(`/api/admin/users?${query}`);
  }

  async getUserDetails(userId: string) {
    return this.request<User & {
      stats: {
        total_bookings: number;
        active_bookings: number;
        total_spent: number;
        total_vehicles: number;
      };
      vehicles: any[];
    }>(`/api/admin/users/${userId}`);
  }

  async createUserByAdmin(data: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role?: string;
  }) {
    return this.request<User>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserByAdmin(userId: string, data: {
    full_name?: string;
    phone?: string;
    role?: string;
    password?: string;
  }) {
    return this.request<User>(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async createParkingSlot(lotId: string, data: {
    slot_number: string;
    slot_type: string;
    status?: string;
    floor_level: number;
  }) {
    return this.request<ParkingSlot>(`/api/admin/parking-lots/${lotId}/slots`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createBulkParkingSlots(lotId: string, params: {
    start_number: number;
    count: number;
    slot_type: string;
    floor_level: number;
  }) {
    const query = new URLSearchParams();
    query.append('start_number', params.start_number.toString());
    query.append('count', params.count.toString());
    query.append('slot_type', params.slot_type);
    query.append('floor_level', params.floor_level.toString());

    return this.request<{ message: string; created_count: number; skipped_count: number }>(
      `/api/admin/parking-lots/${lotId}/slots/bulk?${query}`,
      { method: 'POST' }
    );
  }

  async updateParkingSlot(slotId: string, data: {
    slot_type?: string;
    status?: string;
    floor_level?: number;
  }) {
    return this.request<ParkingSlot>(`/api/admin/parking-slots/${slotId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteParkingSlot(slotId: string) {
    return this.request(`/api/admin/parking-slots/${slotId}`, {
      method: 'DELETE',
    });
  }

  async getRealtimeStats() {
    return this.request<{
      users: { total: number; new_today: number };
      parking_lots: { total: number; active: number };
      slots: { total: number; available: number; occupied: number; occupancy_rate: number };
      bookings: { total: number; active: number; completed: number; today: number };
      revenue: { total: number; today: number };
      recent_activities: Array<{
        id: string;
        user_name: string;
        lot_name: string;
        status: string;
        total_price: number;
        created_at: string;
      }>;
      last_updated: string;
    }>('/api/admin/stats/realtime');
  }
}

// Export singleton instance
export const api = new APIClient();