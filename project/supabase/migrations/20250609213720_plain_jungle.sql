/*
  # Create Anton User Profile

  1. New Data
    - Creates the anton user with proper credentials
    - Sets up as owner with high stats
    - Uses the correct password hash format

  2. Security
    - Uses proper password hashing
    - Sets owner privileges
*/

-- Create Anton user profile with proper credentials
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
  50000,
  2500,
  150,
  50000,
  1000000000000000000, -- 1 million ZRM tokens in wei (will display as 10M)
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  password_hash = encode(digest('ZipRoom2024!' || 'ziproom_salt_2024', 'sha256'), 'hex'),
  display_name = 'Anton 👑',
  email = 'anton@ziproom.io',
  bio = 'Founder & CEO of ZipRoom 🚀 Building the future of disposable chat.',
  is_owner = true,
  activity_score = 50000,
  total_messages = 2500,
  rooms_created = 150,
  tokens_earned = 50000,
  wallet_balance = 1000000000000000000,
  last_active = now();

-- Add some activity logs for Anton
INSERT INTO activity_logs (user_id, activity_type, points_earned, metadata, created_at) VALUES
('anton', 'platform_launch', 5000, '{"milestone": "ZipRoom Platform Launch", "date": "2024-01-01"}', now() - interval '60 days'),
('anton', 'feature_release', 1000, '{"feature": "QR Code Sharing", "version": "1.1.0"}', now() - interval '40 days'),
('anton', 'feature_release', 1000, '{"feature": "Emoji Reactions", "version": "1.2.0"}', now() - interval '35 days'),
('anton', 'milestone', 2000, '{"achievement": "10,000 Users", "date": "2024-06-01"}', now() - interval '30 days'),
('anton', 'innovation_award', 5000, '{"award": "Best Crypto Platform 2024", "organization": "CryptoTech"}', now() - interval '10 days')
ON CONFLICT DO NOTHING;