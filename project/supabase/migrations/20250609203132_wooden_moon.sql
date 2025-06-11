/*
  # Fix user_sessions RLS policy for authentication

  1. Security Changes
    - Update INSERT policy on `user_sessions` table to allow session creation during login
    - The current policy prevents session creation because `app.current_user_id` is not set during authentication
    - New policy allows anyone to create sessions (which is necessary for login flow)
    - Keep existing policies for SELECT and DELETE operations intact

  2. Notes
    - This is required for the custom authentication system to work properly
    - Sessions are validated by token expiration and proper cleanup
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Allow session creation during login" ON user_sessions;

-- Create a new policy that allows session creation during login
CREATE POLICY "Allow session creation during login"
  ON user_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Ensure the SELECT policy allows users to read their own sessions
DROP POLICY IF EXISTS "Users can read own sessions" ON user_sessions;
CREATE POLICY "Users can read own sessions"
  ON user_sessions
  FOR SELECT
  TO public
  USING (user_id = current_setting('app.current_user_id'::text, true));

-- Ensure the DELETE policy allows users to delete their own sessions
DROP POLICY IF EXISTS "Users can delete own sessions" ON user_sessions;
CREATE POLICY "Users can delete own sessions"
  ON user_sessions
  FOR DELETE
  TO public
  USING (user_id = current_setting('app.current_user_id'::text, true));