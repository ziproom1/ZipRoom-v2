/*
  # Fix RLS Policy for User Sessions

  1. Problem
    - Current RLS policy prevents session creation during login
    - The policy requires authentication before allowing session insertion
    - This creates a chicken-and-egg problem: can't authenticate without a session, can't create session without authentication

  2. Solution
    - Drop the restrictive INSERT policy
    - Create a new policy that allows session creation for any user that exists in user_profiles
    - This allows the login flow to work while maintaining security

  3. Security
    - Still validates that the user exists in user_profiles before allowing session creation
    - Prevents creation of sessions for non-existent users
    - Maintains read/delete restrictions to user's own sessions
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Allow session creation for valid users" ON user_sessions;
DROP POLICY IF EXISTS "Allow session creation during login" ON user_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON user_sessions;

-- Create a new INSERT policy that allows session creation during login
-- This policy allows both anon and authenticated users to create sessions
-- but only if the user exists in the user_profiles table
CREATE POLICY "Enable session creation for login"
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

-- Ensure the SELECT policy allows users to read their own sessions
DROP POLICY IF EXISTS "Users can read own sessions" ON user_sessions;
CREATE POLICY "Users can read own sessions"
  ON user_sessions
  FOR SELECT
  TO public
  USING (user_id = current_setting('app.current_user_id', true));

-- Ensure the DELETE policy allows users to delete their own sessions
DROP POLICY IF EXISTS "Users can delete own sessions" ON user_sessions;
CREATE POLICY "Users can delete own sessions"
  ON user_sessions
  FOR DELETE
  TO public
  USING (user_id = current_setting('app.current_user_id', true));