/*
  # Fix user_sessions RLS policy for login

  1. Security Updates
    - Update the INSERT policy for user_sessions table to allow session creation during login
    - The policy now properly allows both anonymous and authenticated users to create sessions
    - Maintains security by still requiring the user profile to exist

  2. Changes Made
    - Modified the INSERT policy to work with the anon role during login
    - Keeps the existing security check that the user profile must exist
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Allow session creation during login" ON user_sessions;

-- Create a new INSERT policy that allows both anon and authenticated users to create sessions
-- but still requires the user profile to exist
CREATE POLICY "Allow session creation during login"
  ON user_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.user_id = user_sessions.user_id
    )
  );