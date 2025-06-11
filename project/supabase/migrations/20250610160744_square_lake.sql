/*
  # Complete Anton Profile Deletion

  1. Clean Up
    - Remove ALL anton entries from user_sessions table
    - Remove ALL anton entries from activity_logs table  
    - Remove ALL anton entries from user_profiles table
    - Ensure complete cleanup across all related tables
    
  2. Verification
    - Verify all anton data is completely removed
    - Confirm tables are ready for fresh registration
*/

-- Delete ALL anton entries from all tables (case insensitive)
DELETE FROM user_sessions WHERE LOWER(user_id) = 'anton';
DELETE FROM activity_logs WHERE LOWER(user_id) = 'anton';
DELETE FROM user_profiles WHERE LOWER(user_id) = 'anton';

-- Also clean up any potential variations or duplicates
DELETE FROM user_sessions WHERE user_id ILIKE '%anton%';
DELETE FROM activity_logs WHERE user_id ILIKE '%anton%';
DELETE FROM user_profiles WHERE user_id ILIKE '%anton%';

-- Clean up by email as well
DELETE FROM user_profiles WHERE LOWER(email) LIKE '%anton%ziproom%';

-- Verify complete cleanup
DO $$
DECLARE
    profile_count INTEGER;
    session_count INTEGER;
    activity_count INTEGER;
BEGIN
    -- Check for any remaining anton entries
    SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE LOWER(user_id) = 'anton' OR LOWER(email) LIKE '%anton%';
    SELECT COUNT(*) INTO session_count FROM user_sessions WHERE LOWER(user_id) = 'anton';
    SELECT COUNT(*) INTO activity_count FROM activity_logs WHERE LOWER(user_id) = 'anton';
    
    IF profile_count = 0 AND session_count = 0 AND activity_count = 0 THEN
        RAISE NOTICE 'SUCCESS: All Anton data completely deleted from database';
        RAISE NOTICE 'Database is clean and ready for fresh registration';
    ELSE
        RAISE WARNING 'WARNING: Some Anton data still exists - profiles: %, sessions: %, activities: %', 
                     profile_count, session_count, activity_count;
    END IF;
    
    -- Show total counts for verification
    SELECT COUNT(*) INTO profile_count FROM user_profiles;
    SELECT COUNT(*) INTO session_count FROM user_sessions;
    SELECT COUNT(*) INTO activity_count FROM activity_logs;
    
    RAISE NOTICE 'Total remaining data - profiles: %, sessions: %, activities: %', 
                 profile_count, session_count, activity_count;
END $$;