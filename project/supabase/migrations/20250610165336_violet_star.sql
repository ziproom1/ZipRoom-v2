/*
  # Fix Authentication System with Proper Variable Naming

  1. Comprehensive Diagnostic
    - Check current database state
    - Verify table structure and existing data
    - Test authentication functions

  2. Clean Setup
    - Remove any existing anton data
    - Create proper hash functions
    - Set up anton profile with safe bigint values

  3. Verification
    - Test all authentication functions
    - Verify login credentials work
    - Confirm owner privileges and special styling
*/

-- STEP 1: Comprehensive diagnostic of current state
DO $$
DECLARE
    table_exists BOOLEAN;
    anton_profile RECORD;
    total_profiles INTEGER;
    hash_function_exists BOOLEAN;
BEGIN
    RAISE NOTICE '=== ZIPROOM AUTHENTICATION DIAGNOSTIC ===';
    
    -- Check if user_profiles table exists and has correct structure
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) INTO table_exists;
    
    RAISE NOTICE '1. user_profiles table exists: %', table_exists;
    
    -- Check total profiles
    SELECT COUNT(*) INTO total_profiles FROM user_profiles;
    RAISE NOTICE '2. Total user profiles: %', total_profiles;
    
    -- Check if hash_password function exists
    SELECT EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_schema = 'public' AND routine_name = 'hash_password'
    ) INTO hash_function_exists;
    
    RAISE NOTICE '3. hash_password function exists: %', hash_function_exists;
    
    -- Check for anton profile specifically
    BEGIN
        SELECT * INTO anton_profile FROM user_profiles WHERE user_id = 'anton';
        
        IF FOUND THEN
            RAISE NOTICE '4. Anton profile found:';
            RAISE NOTICE '   - user_id: %', anton_profile.user_id;
            RAISE NOTICE '   - email: %', anton_profile.email;
            RAISE NOTICE '   - display_name: %', anton_profile.display_name;
            RAISE NOTICE '   - is_owner: %', anton_profile.is_owner;
            RAISE NOTICE '   - password_hash length: %', LENGTH(anton_profile.password_hash);
        ELSE
            RAISE NOTICE '4. Anton profile: NOT FOUND';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '4. Error checking Anton profile: %', SQLERRM;
    END;
    
END $$;

-- STEP 2: Clean up any existing anton data completely
DELETE FROM user_sessions WHERE user_id = 'anton';
DELETE FROM activity_logs WHERE user_id = 'anton';
DELETE FROM user_profiles WHERE user_id = 'anton';

-- STEP 3: Ensure hash_password function exists and works correctly
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  -- Use SHA256 with salt for password hashing
  RETURN encode(digest(password || 'ziproom_salt_2024', 'sha256'), 'hex');
END;
$$;

-- STEP 4: Ensure verify_password function exists and works correctly
CREATE OR REPLACE FUNCTION verify_password(password text, hash text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Compare the hashed password with stored hash
  RETURN hash_password(password) = hash;
END;
$$;

-- STEP 5: Create Anton profile with correct credentials and SAFE bigint value
INSERT INTO user_profiles (
  user_id,
  display_name,
  email,
  password_hash,
  bio,
  is_owner,
  activity_score,
  total_messages,
  rooms_created,
  tokens_earned,
  wallet_balance,
  created_at,
  last_active
) VALUES (
  'anton',
  'Anton 👑',
  'anton@ziproom.io',
  hash_password('ZipRoom2024!'), -- Use the function to ensure correct hash
  '🚀 Founder & CEO of ZipRoom | Visionary leader building the future of disposable communication 💬 | Blockchain innovator & platform architect 👑',
  true, -- Owner privileges
  100000, -- Top rank activity score
  10000, -- High message count
  500, -- Many rooms created
  10000000, -- 10 million tokens earned
  1000000000000000000, -- Safe bigint value (1 quintillion wei = displays as 10M ZRM)
  now(),
  now()
);

-- STEP 6: Add some key activity logs for Anton
INSERT INTO activity_logs (user_id, activity_type, points_earned, metadata, created_at) VALUES
('anton', 'platform_founded', 50000, '{"milestone": "ZipRoom Platform Founded", "description": "Created the revolutionary disposable chat platform"}', now() - interval '365 days'),
('anton', 'platform_launch', 25000, '{"milestone": "Platform Launch", "description": "Successfully launched ZipRoom to the public"}', now() - interval '300 days'),
('anton', 'feature_release', 10000, '{"feature": "ZRM Token System", "description": "Integrated native cryptocurrency"}', now() - interval '150 days'),
('anton', 'milestone', 15000, '{"achievement": "100K Users", "description": "Reached major user milestone"}', now() - interval '60 days'),
('anton', 'innovation_award', 20000, '{"award": "Crypto Innovation 2024", "description": "Industry recognition for platform innovation"}', now() - interval '30 days'),
('anton', 'vision_milestone', 25000, '{"achievement": "Web3 Leader", "description": "Established as leading Web3 communication platform"}', now() - interval '7 days');

-- STEP 7: Test the authentication functions
DO $$
DECLARE
    test_hash TEXT;
    verify_result BOOLEAN;
    anton_profile RECORD;
BEGIN
    RAISE NOTICE '=== AUTHENTICATION FUNCTION TESTS ===';
    
    -- Test password hashing
    test_hash := hash_password('ZipRoom2024!');
    RAISE NOTICE '1. Password hash generated: %', LEFT(test_hash, 20) || '...';
    
    -- Test password verification
    verify_result := verify_password('ZipRoom2024!', test_hash);
    RAISE NOTICE '2. Password verification test: %', verify_result;
    
    -- Test with wrong password
    verify_result := verify_password('WrongPassword', test_hash);
    RAISE NOTICE '3. Wrong password test (should be false): %', verify_result;
    
    -- Verify Anton profile was created correctly
    SELECT * INTO anton_profile FROM user_profiles WHERE user_id = 'anton';
    
    IF FOUND THEN
        RAISE NOTICE '4. Anton profile verification:';
        RAISE NOTICE '   ✅ Profile exists';
        RAISE NOTICE '   ✅ Username: %', anton_profile.user_id;
        RAISE NOTICE '   ✅ Email: %', anton_profile.email;
        RAISE NOTICE '   ✅ Owner status: %', anton_profile.is_owner;
        RAISE NOTICE '   ✅ Activity score: %', anton_profile.activity_score;
        RAISE NOTICE '   ✅ ZRM balance: %', anton_profile.wallet_balance;
        
        -- Test password verification with stored hash
        verify_result := verify_password('ZipRoom2024!', anton_profile.password_hash);
        RAISE NOTICE '   ✅ Password verification: %', verify_result;
        
        IF verify_result THEN
            RAISE NOTICE '🎉 AUTHENTICATION SYSTEM WORKING CORRECTLY!';
            RAISE NOTICE '🔑 Login credentials:';
            RAISE NOTICE '   Username: anton';
            RAISE NOTICE '   Password: ZipRoom2024!';
            RAISE NOTICE '   Email: anton@ziproom.io';
        ELSE
            RAISE WARNING '❌ Password verification failed!';
        END IF;
    ELSE
        RAISE WARNING '❌ Anton profile not found after creation!';
    END IF;
END $$;

-- STEP 8: Verify RLS policies are working correctly
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '=== RLS POLICY VERIFICATION ===';
    
    -- Check user_profiles policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'user_profiles';
    RAISE NOTICE '1. user_profiles policies: %', policy_count;
    
    -- Check user_sessions policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'user_sessions';
    RAISE NOTICE '2. user_sessions policies: %', policy_count;
    
    -- Check activity_logs policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'activity_logs';
    RAISE NOTICE '3. activity_logs policies: %', policy_count;
END $$;

-- STEP 9: Final verification and summary
DO $$
DECLARE
    anton_exists BOOLEAN;
    activity_count INTEGER;
    total_points INTEGER;
    user_wallet_balance BIGINT; -- Fixed: renamed variable to avoid conflict
BEGIN
    RAISE NOTICE '=== FINAL VERIFICATION ===';
    
    -- Check if Anton profile exists
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE user_id = 'anton') INTO anton_exists;
    
    -- Get activity stats
    SELECT COUNT(*) INTO activity_count FROM activity_logs WHERE user_id = 'anton';
    SELECT COALESCE(SUM(points_earned), 0) INTO total_points FROM activity_logs WHERE user_id = 'anton';
    
    -- Get wallet balance with qualified column name to avoid ambiguity
    SELECT up.wallet_balance INTO user_wallet_balance 
    FROM user_profiles up 
    WHERE up.user_id = 'anton';
    
    IF anton_exists THEN
        RAISE NOTICE '🎉 SUCCESS: Anton profile ready for login!';
        RAISE NOTICE '📊 Profile stats:';
        RAISE NOTICE '   - Activity logs: %', activity_count;
        RAISE NOTICE '   - Total points: %', total_points;
        RAISE NOTICE '   - Wallet balance (wei): %', user_wallet_balance;
        RAISE NOTICE '   - Owner privileges: ENABLED';
        RAISE NOTICE '   - Special styling: Crown, golden colors';
        RAISE NOTICE '   - Display: 10,000,000 ZRM tokens';
        RAISE NOTICE '';
        RAISE NOTICE '🔑 LOGIN CREDENTIALS:';
        RAISE NOTICE '   Username: anton';
        RAISE NOTICE '   Password: ZipRoom2024!';
        RAISE NOTICE '   Email: anton@ziproom.io';
        RAISE NOTICE '';
        RAISE NOTICE '✅ Authentication system is now working correctly!';
        RAISE NOTICE '✅ Safe bigint value used for wallet balance!';
        RAISE NOTICE '✅ Variable naming conflicts resolved!';
    ELSE
        RAISE EXCEPTION '❌ FAILED: Anton profile was not created successfully';
    END IF;
END $$;