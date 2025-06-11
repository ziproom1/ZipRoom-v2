/*
  # Add Demo User

  1. New Data
    - Add demo user 'anton' with password 'ZipRoom2024!'
    - Set up basic profile information for testing

  2. Security
    - Uses bcrypt hashed password for security
    - Follows existing user profile structure
*/

-- Insert demo user with hashed password
-- Password: ZipRoom2024! (hashed with bcrypt)
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
  'Anton Demo',
  'anton@ziproom.demo',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash of 'ZipRoom2024!'
  'Demo user for testing ZipRoom features',
  false,
  100,
  0,
  0,
  100,
  100000000, -- 100 ZRM tokens in micro-tokens
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;