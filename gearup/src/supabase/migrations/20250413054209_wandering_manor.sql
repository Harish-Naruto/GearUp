/*
  # Initial Schema Setup for Vehicle Repair Services

  1. New Tables
    - users: Store user accounts and profile data
    - garages: Repair shop information and services
    - workers: Garage staff and their specializations
    - bookings: Service appointments and status
    - notifications: System notifications and alerts
    
  2. Security
    - Enable RLS on all tables
    - Add policies for data access based on user roles
    - Secure user data and sensitive information
*/

-- Create enum types for various statuses
CREATE TYPE user_role AS ENUM ('USER', 'MANAGER', 'WORKER', 'ADMIN');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED');
CREATE TYPE notification_type AS ENUM ('BOOKING', 'PAYMENT', 'SYSTEM', 'UPDATE');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role user_role NOT NULL DEFAULT 'USER',
  profile_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Garages table
CREATE TABLE IF NOT EXISTS garages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location jsonb NOT NULL,
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  ratings numeric DEFAULT 0,
  total_ratings integer DEFAULT 0,
  manager_id uuid REFERENCES users(id),
  operating_hours jsonb NOT NULL DEFAULT '{}'::jsonb,
  contact_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workers table
CREATE TABLE IF NOT EXISTS workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  garage_id uuid REFERENCES garages(id) NOT NULL,
  specialization text[] NOT NULL DEFAULT '{}',
  availability jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text DEFAULT 'ACTIVE',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  garage_id uuid REFERENCES garages(id) NOT NULL,
  worker_id uuid REFERENCES workers(id),
  service_type text NOT NULL,
  description text,
  scheduled_time timestamptz NOT NULL,
  estimated_duration interval,
  status booking_status DEFAULT 'PENDING',
  payment_status payment_status DEFAULT 'PENDING',
  amount decimal(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid REFERENCES users(id) NOT NULL,
  type notification_type NOT NULL,
  content jsonb NOT NULL,
  read_status boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow insert for authenticated users"
ON users
FOR INSERT
TO authenticated
USING (auth.uid() = id);


-- Garages policies
CREATE POLICY "Anyone can view garages"
  ON garages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can update their garage"
  ON garages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = manager_id);

-- Workers policies
CREATE POLICY "Workers visible to authenticated users"
  ON workers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Workers can update their own data"
  ON workers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Users can view their bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM workers WHERE garage_id = bookings.garage_id
    ) OR
    auth.uid() IN (
      SELECT manager_id FROM garages WHERE id = bookings.garage_id
    )
  );

CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM workers WHERE garage_id = bookings.garage_id
    ) OR
    auth.uid() IN (
      SELECT manager_id FROM garages WHERE id = bookings.garage_id
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their notification status"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_garages_manager ON garages(manager_id);
CREATE INDEX IF NOT EXISTS idx_workers_garage ON workers(garage_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_garage ON bookings(garage_id);
CREATE INDEX IF NOT EXISTS idx_bookings_worker ON bookings(worker_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garages_updated_at
    BEFORE UPDATE ON garages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at
    BEFORE UPDATE ON workers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();