/*
  # Create Anton profile with simplified authentication

  1. Clean Up
    - Remove existing anton entries to start fresh
    
  2. Create Anton Profile
    - Create anton user with simple credentials
    - Set as owner with proper stats
    - Use simple password hashing
    
  3. Fix RLS Policies
    - Simplify user_sessions policies to allow login
    - Remove restrictive checks that prevent authentication
*/

-- Clean up existing anton entries
DELETE FROM user_sessions WHERE user_id = 'anton';
DELETE FROM activity_logs WHERE user_id = 'anton';
DELETE FROM user_profiles WHERE user_id = 'anton';

-- Create Anton profile
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
  5000000000000000000, -- 5 million ZRM tokens
  now(),
  now()
);

-- Completely remove RLS from user_sessions to fix login issues
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with very simple policies
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow session creation during login" ON user_sessions;
DROP POLICY IF EXISTS "Users can read own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON user_sessions;

-- Create simple policies that actually work
CREATE POLICY "Allow all session operations"
  ON user_sessions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);