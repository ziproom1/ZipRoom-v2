/*
  # User Profile System Migration

  1. New Tables
    - `user_profiles` - User account information and stats
    - `user_sessions` - Authentication session management  
    - `activity_logs` - User activity tracking for rewards

  2. Security
    - Enable RLS on all new tables
    - Add policies for user data access control
    - Create indexes for performance

  3. Functions
    - `update_user_activity` - Track user actions and award points
    - `clean_expired_sessions` - Remove expired authentication sessions

  4. Initial Data
    - Create ANT 5X owner profile with 1M ZRM tokens
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  display_name text NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  bio text DEFAULT '',
  is_owner boolean DEFAULT false,
  activity_score integer DEFAULT 0,
  total_messages integer DEFAULT 0,
  rooms_created integer DEFAULT 0,
  tokens_earned integer DEFAULT 0,
  wallet_balance bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  points_earned integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read all profiles"
  ON user_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO public
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Anyone can create profiles"
  ON user_profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for user_sessions
CREATE POLICY "Users can read own sessions"
  ON user_sessions
  FOR SELECT
  TO public
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can create own sessions"
  ON user_sessions
  FOR INSERT
  TO public
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete own sessions"
  ON user_sessions
  FOR DELETE
  TO public
  USING (user_id = current_setting('app.current_user_id', true));

-- RLS Policies for activity_logs
CREATE POLICY "Users can read own activity"
  ON activity_logs
  FOR SELECT
  TO public
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "System can create activity logs"
  ON activity_logs
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_activity_score ON user_profiles(activity_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Insert ANT 5X owner profile
INSERT INTO user_profiles (
  user_id,
  display_name,
  email,
  is_owner,
  activity_score,
  wallet_balance,
  bio
) VALUES (
  'ANT 5X',
  'ANT 5X 👑',
  'ant5x@ziproom.io',
  true,
  10000,
  1000000000000000000, -- 1 million ZRM tokens (18 decimals) - fixed bigint range
  'Founder & Owner of ZipRoom 🚀⚡'
) ON CONFLICT (user_id) DO NOTHING;

-- Function to update activity score
CREATE OR REPLACE FUNCTION update_user_activity(
  p_user_id text,
  p_activity_type text,
  p_points integer DEFAULT 1,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert activity log
  INSERT INTO activity_logs (user_id, activity_type, points_earned, metadata)
  VALUES (p_user_id, p_activity_type, p_points, p_metadata);
  
  -- Update user profile stats
  UPDATE user_profiles
  SET 
    activity_score = activity_score + p_points,
    total_messages = CASE WHEN p_activity_type = 'message' THEN total_messages + 1 ELSE total_messages END,
    rooms_created = CASE WHEN p_activity_type = 'room_created' THEN rooms_created + 1 ELSE rooms_created END,
    tokens_earned = tokens_earned + p_points,
    last_active = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < now();
END;
$$;