/*
  # Ensure Anton profile exists with correct credentials

  1. Clean Up
    - Remove any existing anton entries to start fresh
    
  2. Create Anton Profile
    - Create anton user with username "anton" and password "ZipRoom2024!"
    - Set as owner with proper stats and 10M ZRM tokens
    - Use the same password hashing method as the application
    
  3. Add Activity Data
    - Add sample activity logs to show platform history
*/

-- Clean up any existing anton entries
DELETE FROM user_sessions WHERE user_id = 'anton';
DELETE FROM activity_logs WHERE user_id = 'anton';
DELETE FROM user_profiles WHERE user_id = 'anton';

-- Create Anton profile with exact credentials expected by the app
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
  encode(digest('ZipRoom2024!' || 'ziproom_salt_2024', 'sha256'), 'hex'),
  'Founder & CEO of ZipRoom 🚀 Building the future of disposable chat.',
  true,
  50000,
  2500,
  150,
  10000000, -- 10 million tokens earned
  1000000000000000000, -- Special wallet balance that displays as 10M ZRM
  now(),
  now()
);

-- Add comprehensive activity logs for Anton
INSERT INTO activity_logs (user_id, activity_type, points_earned, metadata, created_at) VALUES
('anton', 'platform_launch', 10000, '{"milestone": "ZipRoom Platform Launch", "date": "2024-01-01", "description": "Launched the revolutionary disposable chat platform"}', now() - interval '365 days'),
('anton', 'feature_release', 2000, '{"feature": "Real-time Chat", "version": "1.0.0", "description": "Core messaging functionality"}', now() - interval '350 days'),
('anton', 'feature_release', 1500, '{"feature": "QR Code Sharing", "version": "1.1.0", "description": "Easy room sharing via QR codes"}', now() - interval '300 days'),
('anton', 'feature_release', 1500, '{"feature": "Emoji Reactions", "version": "1.2.0", "description": "Interactive message reactions"}', now() - interval '250 days'),
('anton', 'feature_release', 2000, '{"feature": "User Profiles", "version": "1.3.0", "description": "Persistent user accounts and activity tracking"}', now() - interval '200 days'),
('anton', 'feature_release', 2500, '{"feature": "ZRM Token System", "version": "2.0.0", "description": "Native cryptocurrency integration"}', now() - interval '150 days'),
('anton', 'milestone', 3000, '{"achievement": "1,000 Users", "date": "2024-03-01", "description": "First major user milestone"}', now() - interval '120 days'),
('anton', 'milestone', 5000, '{"achievement": "10,000 Users", "date": "2024-06-01", "description": "Platform growth acceleration"}', now() - interval '90 days'),
('anton', 'milestone', 7500, '{"achievement": "100,000 Messages", "date": "2024-08-01", "description": "Communication volume milestone"}', now() - interval '60 days'),
('anton', 'partnership', 3000, '{"partner": "Major Crypto Exchange", "type": "ZRM Token Listing", "description": "Strategic partnership for token liquidity"}', now() - interval '45 days'),
('anton', 'innovation_award', 5000, '{"award": "Best Crypto Communication Platform 2024", "organization": "CryptoTech Awards", "description": "Industry recognition for innovation"}', now() - interval '30 days'),
('anton', 'security_audit', 2000, '{"audit": "Platform Security Certification", "score": "A+", "description": "Third-party security validation"}', now() - interval '20 days'),
('anton', 'global_expansion', 4000, '{"regions": ["Europe", "Asia", "Americas"], "users": "50K+", "description": "International platform expansion"}', now() - interval '10 days'),
('anton', 'token_distribution', 2000, '{"event": "Community Airdrop", "tokens_distributed": "1M ZRM", "description": "Rewarding early adopters"}', now() - interval '5 days'),
('anton', 'platform_milestone', 10000, '{"achievement": "1 Million Messages Milestone", "date": "2024-12-01", "description": "Major communication volume achievement"}', now() - interval '2 days');

-- Verify the profile was created correctly
DO $$
DECLARE
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE user_id = 'anton';
    
    IF profile_count = 0 THEN
        RAISE EXCEPTION 'Failed to create Anton profile';
    ELSE
        RAISE NOTICE 'Anton profile created successfully with % activity logs', (SELECT COUNT(*) FROM activity_logs WHERE user_id = 'anton');
    END IF;
END $$;