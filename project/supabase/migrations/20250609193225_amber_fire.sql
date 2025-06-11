/*
  # Create demo user for testing

  1. New Data
    - Creates a demo user 'ant5x' with password 'ZipRoom2024!'
    - Sets up the user as an owner with some initial activity data
  
  2. Security
    - Uses the existing RLS policies
    - Password is properly hashed using the hash_password function
*/

-- Create the demo user profile
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
  wallet_balance
) VALUES (
  'ant5x',
  'Ant5x 🚀',
  'demo@ziproom.com',
  hash_password('ZipRoom2024!'),
  'Demo user account for testing ZipRoom features',
  true,
  100,
  25,
  3,
  50,
  1000000000000000000 -- 1 ZRM token in wei
) ON CONFLICT (user_id) DO UPDATE SET
  password_hash = hash_password('ZipRoom2024!'),
  is_owner = true,
  display_name = 'Ant5x 🚀',
  email = 'demo@ziproom.com',
  bio = 'Demo user account for testing ZipRoom features';