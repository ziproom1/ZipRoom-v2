/*
  # Delete demo profile to allow fresh signup

  1. Clean Up
    - Remove all existing anton entries from all tables
    - This allows fresh registration with username "anton"
    
  2. Security
    - Maintains all existing RLS policies
    - No changes to authentication system
*/

-- Remove all existing anton entries to allow fresh signup
DELETE FROM user_sessions WHERE user_id = 'anton';
DELETE FROM activity_logs WHERE user_id = 'anton';
DELETE FROM user_profiles WHERE user_id = 'anton';