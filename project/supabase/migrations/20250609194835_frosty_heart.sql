/*
  # Fix user_sessions RLS policy for login

  1. Security Changes
    - Update the INSERT policy for `user_sessions` table to properly allow session creation
    - The policy now checks that the user_id exists in user_profiles table using a simpler approach
    - This allows the login process to create sessions without RLS violations

  2. Changes Made
    - Drop the existing problematic INSERT policy
    - Create a new INSERT policy that properly validates user existence
    - Ensure the policy works with the anonymous role during login
*/

-- Drop the existing problematic INSERT policy
DROP POLICY IF EXISTS "Enable session creation for login" ON user_sessions;

-- Create a new INSERT policy that allows session creation for valid users
CREATE POLICY "Users can create sessions for valid profiles"
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