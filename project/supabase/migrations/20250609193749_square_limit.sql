/*
  # Fix ANT 5X user profile with normalized username

  1. Updates
    - Remove old ANT 5X entries that might exist
    - Create new ant5x profile with normalized username
    - Set proper password hash for demo login
    - Ensure is_owner flag is set correctly

  2. Security
    - Maintains RLS policies
    - Uses proper password hashing
*/

-- Remove any existing ANT 5X or ant5x entries to avoid conflicts
DELETE FROM user_sessions WHERE user_id IN ('ANT 5X', 'ant5x');
DELETE FROM activity_logs WHERE user_id IN ('ANT 5X', 'ant5x');
DELETE FROM user_profiles WHERE user_id IN ('ANT 5X', 'ant5x');

-- Create the normalized ant5x user profile
INSERT INTO user_profiles (
  user_id,
  display_name,
  email,
  password_hash,
  bio,
  is_owner,
  activity_score,
  total_messages,
  rooms_created,
  tokens_earned,
  wallet_balance,
  created_at,
  last_active
) VALUES (
  'ant5x',
  'ANT 5X 👑',
  'ant5x@ziproom.io',
  encode(digest('ZipRoom2024!' || 'ziproom_salt_2024', 'sha256'), 'hex'),
  'Founder & Owner of ZipRoom 🚀⚡',
  true,
  10000,
  500,
  25,
  10000,
  1000000000000000000, -- 1 million ZRM tokens in wei (18 decimals)
  now(),
  now()
);

-- Add some sample activity logs for the owner
INSERT INTO activity_logs (user_id, activity_type, points_earned, metadata) VALUES
('ant5x', 'room_created', 10, '{"room_name": "Welcome Room", "description": "First room created"}'),
('ant5x', 'message', 1, '{"content_length": 50, "room_id": "DEMO01"}'),
('ant5x', 'platform_launch', 1000, '{"milestone": "ZipRoom Platform Launch", "date": "2024-01-01"}');