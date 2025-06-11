/*
  # ZipRoom Database Schema

  1. New Tables
    - `rooms`
      - `id` (uuid, primary key)
      - `room_id` (text, unique 6-character identifier)
      - `name` (text, room name)
      - `creator_id` (text, creator identifier)
      - `expires_at` (timestamptz, when room expires)
      - `token_requirement` (integer, optional ZRM token requirement)
      - `is_active` (boolean, room status)
      - `created_at` (timestamptz)
    
    - `room_users`
      - `id` (uuid, primary key)
      - `room_id` (text, foreign key to rooms.room_id)
      - `user_id` (text, user identifier)
      - `username` (text, display name)
      - `is_admin` (boolean, admin status)
      - `joined_at` (timestamptz)
    
    - `messages`
      - `id` (uuid, primary key)
      - `room_id` (text, foreign key to rooms.room_id)
      - `user_id` (text, message sender)
      - `username` (text, sender display name)
      - `content` (text, message content)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since rooms are anonymous)
    - Add cleanup policies for expired rooms
*/

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text UNIQUE NOT NULL,
  name text NOT NULL,
  creator_id text NOT NULL DEFAULT 'anonymous',
  expires_at timestamptz NOT NULL,
  token_requirement integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create room_users table
CREATE TABLE IF NOT EXISTS room_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
  user_id text NOT NULL,
  username text NOT NULL,
  is_admin boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
  user_id text NOT NULL,
  username text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anonymous rooms)
CREATE POLICY "Anyone can read active rooms"
  ON rooms
  FOR SELECT
  USING (is_active = true AND expires_at > now());

CREATE POLICY "Anyone can create rooms"
  ON rooms
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read room users"
  ON room_users
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join rooms"
  ON room_users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read messages"
  ON messages
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can send messages"
  ON messages
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_room_id ON rooms(room_id);
CREATE INDEX IF NOT EXISTS idx_rooms_expires_at ON rooms(expires_at);
CREATE INDEX IF NOT EXISTS idx_room_users_room_id ON room_users(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Function to clean up expired rooms
CREATE OR REPLACE FUNCTION cleanup_expired_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;