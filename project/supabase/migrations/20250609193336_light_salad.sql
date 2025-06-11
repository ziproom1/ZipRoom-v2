/*
  # Fix user_sessions RLS policy for login

  1. Security Changes
    - Update the INSERT policy for `user_sessions` table to allow session creation during login
    - The current policy prevents login because it requires the user to already be authenticated
    - New policy allows INSERT operations for the anon role during the authentication process

  2. Policy Updates
    - Modify the "Users can create own sessions" policy to work with the login flow
    - Keep the existing SELECT and DELETE policies unchanged for security
*/

-- Drop the existing INSERT policy that's preventing login
DROP POLICY IF EXISTS "Users can create own sessions" ON user_sessions;

-- Create a new INSERT policy that allows session creation during login
-- This allows the anon role to create sessions, which is necessary for the login process
CREATE POLICY "Allow session creation during login"
  ON user_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Keep the existing SELECT policy (users can only read their own sessions)
-- This policy should already exist and work correctly

-- Keep the existing DELETE policy (users can only delete their own sessions)  
-- This policy should already exist and work correctly