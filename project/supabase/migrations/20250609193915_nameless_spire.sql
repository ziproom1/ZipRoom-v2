/*
  # Create Anton Owner Account

  1. Clean Up
    - Remove any existing ant5x entries from all tables
    
  2. New Owner Account
    - Create "anton" user profile with owner privileges
    - Set password to "ZipRoom2024!"
    - Add sample activity and stats
    
  3. Security
    - Ensure proper password hashing
    - Set owner flag to true
*/

-- Remove any existing ant5x entries to avoid conflicts
DELETE FROM user_sessions WHERE user_id = 'ant5x';
DELETE FROM activity_logs WHERE user_id = 'ant5x';
DELETE FROM user_profiles WHERE user_id = 'ant5x';

-- Create the new Anton owner profile
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
  'anton',
  'Anton 👑',
  'anton@ziproom.io',
  encode(digest('ZipRoom2024!' || 'ziproom_salt_2024', 'sha256'), 'hex'),
  'Founder & CEO of ZipRoom 🚀 Building the future of disposable chat.',
  true,
  15000,
  750,
  50,
  15000,
  5000000000000000000, -- 5 million ZRM tokens in wei (18 decimals)
  now(),
  now()
);

-- Add some sample activity logs for Anton
INSERT INTO activity_logs (user_id, activity_type, points_earned, metadata) VALUES
('anton', 'platform_launch', 5000, '{"milestone": "ZipRoom Platform Launch", "date": "2024-01-01"}'),
('anton', 'room_created', 10, '{"room_name": "Welcome Room", "description": "First room created"}'),
('anton', 'room_created', 10, '{"room_name": "Tech Talk", "description": "Developer discussions"}'),
('anton', 'room_created', 10, '{"room_name": "Community Hub", "description": "General community chat"}'),
('anton', 'message', 1, '{"content_length": 45, "room_id": "DEMO01"}'),
('anton', 'message', 1, '{"content_length": 62, "room_id": "DEMO02"}'),
('anton', 'feature_release', 1000, '{"feature": "QR Code Sharing", "version": "1.1.0"}'),
('anton', 'feature_release', 1000, '{"feature": "Emoji Reactions", "version": "1.2.0"}'),
('anton', 'milestone', 2000, '{"achievement": "1000 Users", "date": "2024-06-01"}');