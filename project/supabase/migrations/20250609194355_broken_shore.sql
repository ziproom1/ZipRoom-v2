/*
  # Fix user_sessions RLS policy for login

  1. Security Changes
    - Update the INSERT policy for user_sessions table to allow session creation during login
    - The policy now checks that the user_id exists in user_profiles table
    - This allows the anon role to create sessions for valid users during login

  2. Changes Made
    - Drop the existing restrictive INSERT policy
    - Create a new INSERT policy that allows session creation for existing users
    - Keep the existing SELECT and DELETE policies unchanged
*/

-- Drop the existing INSERT policy that's too restrictive
DROP POLICY IF EXISTS "Allow session creation during login" ON user_sessions;

-- Create a new INSERT policy that allows creating sessions for existing users
CREATE POLICY "Allow session creation for valid users"
  ON user_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = user_sessions.user_id
    )
  );