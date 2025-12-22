/*
  # Car Parking Assistance System Database Schema

  ## Overview
  This migration creates the complete database schema for a car parking assistance system
  with user and admin roles, parking lots, slots, and booking management.

  ## Tables Created

  ### 1. profiles
  - Extends auth.users with additional user information
  - Stores user role (user/admin), phone, and metadata
  - Links to auth.users via user_id

  ### 2. parking_lots
  - Stores parking lot information (name, location, capacity, pricing)
  - Includes latitude/longitude for Google Maps integration
  - Tracks operating hours and amenities

  ### 3. parking_slots
  - Individual parking slots within each parking lot
  - Tracks slot number, type (regular/disabled/electric), status (available/occupied/reserved)
  - Links to parking_lots via lot_id

  ### 4. bookings
  - User parking reservations
  - Tracks booking times, status, payment info
  - Links to users, parking_lots, and parking_slots

  ## Security
  - RLS enabled on all tables
  - Users can read their own profile and update it
  - Users can view available parking lots and slots
  - Users can create bookings and view their own bookings
  - Admins have full access to manage parking lots, slots, and view all bookings
  - Public read access to parking lots and available slots for browsing

  ## Important Notes
  - All timestamps use timestamptz for proper timezone handling
  - Default values set for boolean and timestamp fields
  - Foreign key constraints ensure data integrity
  - Indexes added for frequently queried columns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create parking_lots table
CREATE TABLE IF NOT EXISTS parking_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  total_slots integer NOT NULL DEFAULT 0,
  available_slots integer NOT NULL DEFAULT 0,
  price_per_hour decimal(10, 2) NOT NULL,
  operating_hours text NOT NULL DEFAULT '24/7',
  amenities text[] DEFAULT '{}',
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE parking_lots ENABLE ROW LEVEL SECURITY;

-- Parking lots policies
CREATE POLICY "Anyone can view active parking lots"
  ON parking_lots FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert parking lots"
  ON parking_lots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update parking lots"
  ON parking_lots FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete parking lots"
  ON parking_lots FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create parking_slots table
CREATE TABLE IF NOT EXISTS parking_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  slot_number text NOT NULL,
  slot_type text NOT NULL DEFAULT 'regular' CHECK (slot_type IN ('regular', 'disabled', 'electric', 'compact')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  floor_level integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(lot_id, slot_number)
);

ALTER TABLE parking_slots ENABLE ROW LEVEL SECURITY;

-- Parking slots policies
CREATE POLICY "Anyone can view parking slots"
  ON parking_slots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert parking slots"
  ON parking_slots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update parking slots"
  ON parking_slots FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete parking slots"
  ON parking_slots FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lot_id uuid NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  slot_id uuid NOT NULL REFERENCES parking_slots(id) ON DELETE CASCADE,
  vehicle_number text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  total_price decimal(10, 2) NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any booking"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_parking_lots_location ON parking_lots(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_parking_slots_lot_id ON parking_slots(lot_id);
CREATE INDEX IF NOT EXISTS idx_parking_slots_status ON parking_slots(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_lot_id ON bookings(lot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parking_lots_updated_at BEFORE UPDATE ON parking_lots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parking_slots_updated_at BEFORE UPDATE ON parking_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();