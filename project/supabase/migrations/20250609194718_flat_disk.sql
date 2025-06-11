/*
  # Fix user_sessions RLS policy for custom authentication

  1. Policy Updates
    - Update the INSERT policy for user_sessions table to allow public role
    - This enables custom authentication system to create sessions
    - Maintains security by checking user_profiles existence

  2. Security
    - Keeps the existing check that user must exist in user_profiles
    - Allows public role to insert sessions (needed for custom auth)
    - Maintains other existing policies unchanged
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Enable session creation for login" ON user_sessions;

-- Create a new policy that allows public role to insert sessions
-- but still requires the user to exist in user_profiles
CREATE POLICY "Enable session creation for login"
  ON user_sessions
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_profiles.user_id = user_sessions.user_id
    )
  );