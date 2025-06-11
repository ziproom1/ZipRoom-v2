/*
  # Comprehensive Anton Profile Deletion Verification

  1. Verification
    - Check all tables for any traces of Anton profile data
    - Search by user_id, display_name, email patterns
    - Provide detailed reporting of findings
    - List all existing usernames for verification

  2. Security
    - Read-only verification queries
    - No data modification
    - Comprehensive search patterns
*/

-- Comprehensive search for any Anton-related data
DO $$
DECLARE
    profile_count INTEGER;
    session_count INTEGER;
    activity_count INTEGER;
    email_count INTEGER;
    sample_profile RECORD;
    sample_session RECORD;
    sample_activity RECORD;
BEGIN
    RAISE NOTICE '=== COMPREHENSIVE ANTON PROFILE DELETION VERIFICATION ===';
    
    -- Check user_profiles table
    SELECT COUNT(*) INTO profile_count 
    FROM user_profiles 
    WHERE LOWER(user_id) = 'anton' 
       OR LOWER(user_id) LIKE '%anton%'
       OR LOWER(display_name) LIKE '%anton%'
       OR LOWER(email) LIKE '%anton%';
    
    -- Check user_sessions table
    SELECT COUNT(*) INTO session_count 
    FROM user_sessions 
    WHERE LOWER(user_id) = 'anton' 
       OR LOWER(user_id) LIKE '%anton%';
    
    -- Check activity_logs table
    SELECT COUNT(*) INTO activity_count 
    FROM activity_logs 
    WHERE LOWER(user_id) = 'anton' 
       OR LOWER(user_id) LIKE '%anton%';
    
    -- Check specifically for anton@ziproom.io email
    SELECT COUNT(*) INTO email_count 
    FROM user_profiles 
    WHERE LOWER(email) = 'anton@ziproom.io';
    
    RAISE NOTICE 'SEARCH RESULTS:';
    RAISE NOTICE '- user_profiles with anton data: %', profile_count;
    RAISE NOTICE '- user_sessions with anton data: %', session_count;
    RAISE NOTICE '- activity_logs with anton data: %', activity_count;
    RAISE NOTICE '- profiles with anton@ziproom.io email: %', email_count;
    
    -- If any data found, show samples
    IF profile_count > 0 THEN
        SELECT * INTO sample_profile 
        FROM user_profiles 
        WHERE LOWER(user_id) = 'anton' 
           OR LOWER(user_id) LIKE '%anton%'
           OR LOWER(display_name) LIKE '%anton%'
           OR LOWER(email) LIKE '%anton%'
        LIMIT 1;
        
        RAISE NOTICE 'SAMPLE PROFILE FOUND: user_id=%, email=%, display_name=%', 
                     sample_profile.user_id, sample_profile.email, sample_profile.display_name;
    END IF;
    
    IF session_count > 0 THEN
        SELECT * INTO sample_session 
        FROM user_sessions 
        WHERE LOWER(user_id) = 'anton' 
           OR LOWER(user_id) LIKE '%anton%'
        LIMIT 1;
        
        RAISE NOTICE 'SAMPLE SESSION FOUND: user_id=%, session_token=%', 
                     sample_session.user_id, LEFT(sample_session.session_token, 20) || '...';
    END IF;
    
    IF activity_count > 0 THEN
        SELECT * INTO sample_activity 
        FROM activity_logs 
        WHERE LOWER(user_id) = 'anton' 
           OR LOWER(user_id) LIKE '%anton%'
        LIMIT 1;
        
        RAISE NOTICE 'SAMPLE ACTIVITY FOUND: user_id=%, activity_type=%', 
                     sample_activity.user_id, sample_activity.activity_type;
    END IF;
    
    -- Final verification
    IF profile_count = 0 AND session_count = 0 AND activity_count = 0 AND email_count = 0 THEN
        RAISE NOTICE '✅ SUCCESS: NO ANTON DATA FOUND ANYWHERE';
        RAISE NOTICE '✅ Database is completely clean';
        RAISE NOTICE '✅ Ready for fresh anton registration';
    ELSE
        RAISE WARNING '❌ ANTON DATA STILL EXISTS IN DATABASE';
        RAISE WARNING '❌ Total entries found: %', (profile_count + session_count + activity_count + email_count);
    END IF;
    
    -- Show overall database stats
    SELECT COUNT(*) INTO profile_count FROM user_profiles;
    SELECT COUNT(*) INTO session_count FROM user_sessions;
    SELECT COUNT(*) INTO activity_count FROM activity_logs;
    
    RAISE NOTICE 'TOTAL DATABASE CONTENTS:';
    RAISE NOTICE '- Total user profiles: %', profile_count;
    RAISE NOTICE '- Total user sessions: %', session_count;
    RAISE NOTICE '- Total activity logs: %', activity_count;
    
END $$;

-- Additional check: List all existing usernames to verify anton is not among them
DO $$
DECLARE
    user_list TEXT;
    total_users INTEGER;
BEGIN
    -- Get count first
    SELECT COUNT(*) INTO total_users FROM user_profiles;
    
    IF total_users = 0 THEN
        RAISE NOTICE 'EXISTING USERNAMES: (none - database is empty)';
    ELSE
        -- Fixed: Use subquery to avoid GROUP BY issue
        SELECT STRING_AGG(user_id, ', ' ORDER BY user_id) INTO user_list 
        FROM (SELECT DISTINCT user_id FROM user_profiles ORDER BY user_id) AS sorted_users;
        
        RAISE NOTICE 'EXISTING USERNAMES: %', COALESCE(user_list, '(none)');
    END IF;
END $$;