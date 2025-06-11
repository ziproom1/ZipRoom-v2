/*
  # Fix user_sessions RLS policy for login

  1. Changes
    - Drop the existing restrictive INSERT policy for user_sessions
    - Create a new INSERT policy that allows anyone to create sessions
    - This is necessary because during login, users aren't authenticated yet
    - The session creation happens before authentication is complete

  2. Security
    - Sessions are still protected by unique tokens and expiration
    - Only authenticated users can read/delete their own sessions
    - The INSERT policy allows session creation during the login flow
*/

-- Drop the existing INSERT policy that's too restrictive
DROP POLICY IF EXISTS "Anyone can create sessions" ON user_sessions;

-- Create a new INSERT policy that allows session creation during login
CREATE POLICY "Allow session creation during login"
  ON user_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);