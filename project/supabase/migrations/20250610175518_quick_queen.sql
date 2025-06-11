/*
  # Create Anton Profile for Testing

  1. Clean Up
    - Remove any existing anton entries to start fresh
    
  2. Create Anton Profile
    - Create anton user with proper credentials
    - Set as owner with high stats and 10M ZRM tokens
    - Use safe bigint value for wallet balance
    
  3. Add Activity Data
    - Add comprehensive activity logs showing platform history
*/

-- Clean up any existing anton entries completely
DELETE FROM user_sessions WHERE user_id = 'anton';
DELETE FROM activity_logs WHERE user_id = 'anton';
DELETE FROM user_profiles WHERE user_id = 'anton';

-- Ensure password hashing functions exist
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(digest(password || 'ziproom_salt_2024', 'sha256'), 'hex');
END;
$$;

-- Create Anton profile with proper credentials
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
  hash_password('ZipRoom2024!'),
  '🚀 Founder & CEO of ZipRoom | Visionary leader building the future of disposable communication 💬 | Blockchain innovator & platform architect 👑',
  true, -- Owner privileges
  100000, -- Top rank activity score
  10000, -- High message count
  500, -- Many rooms created
  10000000, -- 10 million tokens earned
  1000000000000000000, -- Safe bigint value (displays as 10M ZRM)
  now(),
  now()
);

-- Add comprehensive activity logs for Anton
INSERT INTO activity_logs (user_id, activity_type, points_earned, metadata, created_at) VALUES
('anton', 'platform_founded', 50000, '{"milestone": "ZipRoom Platform Founded", "description": "Created the revolutionary disposable chat platform"}', now() - interval '365 days'),
('anton', 'platform_launch', 25000, '{"milestone": "Platform Launch", "description": "Successfully launched ZipRoom to the public"}', now() - interval '300 days'),
('anton', 'feature_release', 10000, '{"feature": "ZRM Token System", "description": "Integrated native cryptocurrency"}', now() - interval '150 days'),
('anton', 'milestone', 15000, '{"achievement": "100K Users", "description": "Reached major user milestone"}', now() - interval '60 days'),
('anton', 'innovation_award', 20000, '{"award": "Crypto Innovation 2024", "description": "Industry recognition for platform innovation"}', now() - interval '30 days'),
('anton', 'vision_milestone', 25000, '{"achievement": "Web3 Leader", "description": "Established as leading Web3 communication platform"}', now() - interval '7 days');

-- Verify the profile was created successfully
DO $$
DECLARE
    anton_profile RECORD;
    activity_count INTEGER;
    total_points INTEGER;
BEGIN
    -- Get Anton's profile
    SELECT * INTO anton_profile FROM user_profiles WHERE user_id = 'anton';
    
    IF FOUND THEN
        -- Get activity stats
        SELECT COUNT(*) INTO activity_count FROM activity_logs WHERE user_id = 'anton';
        SELECT COALESCE(SUM(points_earned), 0) INTO total_points FROM activity_logs WHERE user_id = 'anton';
        
        RAISE NOTICE '🎉 SUCCESS: Anton profile created successfully!';
        RAISE NOTICE '📊 Profile stats:';
        RAISE NOTICE '   - Username: %', anton_profile.user_id;
        RAISE NOTICE '   - Email: %', anton_profile.email;
        RAISE NOTICE '   - Display name: %', anton_profile.display_name;
        RAISE NOTICE '   - Owner status: %', anton_profile.is_owner;
        RAISE NOTICE '   - Activity score: %', anton_profile.activity_score;
        RAISE NOTICE '   - Wallet balance: %', anton_profile.wallet_balance;
        RAISE NOTICE '   - Activity logs: %', activity_count;
        RAISE NOTICE '   - Total points: %', total_points;
        RAISE NOTICE '';
        RAISE NOTICE '🔑 LOGIN CREDENTIALS:';
        RAISE NOTICE '   Username: anton';
        RAISE NOTICE '   Password: ZipRoom2024!';
        RAISE NOTICE '   Email: anton@ziproom.io';
        RAISE NOTICE '';
        RAISE NOTICE '✅ Profile is ready for login and updates!';
    ELSE
        RAISE EXCEPTION '❌ FAILED: Anton profile was not created';
    END IF;
END $$;