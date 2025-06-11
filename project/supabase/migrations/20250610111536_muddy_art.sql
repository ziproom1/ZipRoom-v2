/*
  # Delete All User Profiles

  1. Clean Up
    - Remove all entries from user_sessions table
    - Remove all entries from activity_logs table  
    - Remove all entries from user_profiles table
    
  2. Reset Tables
    - This will completely clear all user data
    - Tables will remain with their structure intact
    - Ready for fresh user registrations
*/

-- Delete all user sessions
DELETE FROM user_sessions;

-- Delete all activity logs
DELETE FROM activity_logs;

-- Delete all user profiles
DELETE FROM user_profiles;

-- Verify all tables are empty
DO $$
DECLARE
    profile_count INTEGER;
    session_count INTEGER;
    activity_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM user_profiles;
    SELECT COUNT(*) INTO session_count FROM user_sessions;
    SELECT COUNT(*) INTO activity_count FROM activity_logs;
    
    RAISE NOTICE 'Cleanup complete - Profiles: %, Sessions: %, Activities: %', 
                 profile_count, session_count, activity_count;
    
    IF profile_count = 0 AND session_count = 0 AND activity_count = 0 THEN
        RAISE NOTICE 'All user data successfully deleted';
    ELSE
        RAISE WARNING 'Some data may remain in tables';
    END IF;
END $$;