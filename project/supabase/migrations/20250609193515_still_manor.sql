/*
  # Fix user_sessions RLS policy for login

  1. Security Updates
    - Update the INSERT policy for `user_sessions` table to allow public role access during login
    - Ensure sessions can only be created for existing users
    - Maintain security by validating user_id exists in user_profiles

  2. Changes
    - Drop existing restrictive INSERT policy
    - Create new policy that allows public role to insert sessions for valid users
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Allow session creation during login" ON user_sessions;

-- Create a new policy that allows public role to create sessions for existing users
CREATE POLICY "Allow session creation for existing users"
  ON user_sessions
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = user_sessions.user_id
    )
  );