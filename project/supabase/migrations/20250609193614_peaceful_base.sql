/*
  # Fix user_sessions RLS policy for login

  1. Security Changes
    - Update INSERT policy for user_sessions table to allow anon role
    - Maintain security by still checking that the user exists in user_profiles
    - Allow both anon and authenticated roles to create sessions during login

  The current policy prevents login because it only allows authenticated users to create sessions,
  but users need to create a session to become authenticated. This fixes that circular dependency.
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Allow session creation for existing users" ON user_sessions;

-- Create a new INSERT policy that allows anon users to create sessions
-- but still validates that the user exists in user_profiles
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