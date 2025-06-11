/*
  # Delete existing Anton profile to allow fresh registration

  1. Clean Up
    - Remove existing anton user from all tables
    - This allows fresh registration with username "anton"
    - The special owner privileges will be automatically granted during registration

  2. Notes
    - The registration system will detect username "anton" and grant owner privileges
    - Fresh registration will use Supabase Auth for secure password management
*/

-- Remove existing anton entries to allow fresh signup
DELETE FROM user_sessions WHERE user_id = 'anton';
DELETE FROM activity_logs WHERE user_id = 'anton';
DELETE FROM user_profiles WHERE user_id = 'anton';

-- Verify cleanup
DO $$
DECLARE
    profile_count INTEGER;
    session_count INTEGER;
    activity_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE user_id = 'anton';
    SELECT COUNT(*) INTO session_count FROM user_sessions WHERE user_id = 'anton';
    SELECT COUNT(*) INTO activity_count FROM activity_logs WHERE user_id = 'anton';
    
    IF profile_count = 0 AND session_count = 0 AND activity_count = 0 THEN
        RAISE NOTICE 'Anton profile successfully deleted - ready for fresh registration';
    ELSE
        RAISE WARNING 'Some Anton data may still exist: profiles=%, sessions=%, activities=%', 
                     profile_count, session_count, activity_count;
    END IF;
END $$;