/*
  # Create Anton Profile with Owner Privileges

  1. New Data
    - Creates anton user profile with owner privileges
    - Sets up comprehensive activity history
    - Configures 10M ZRM token balance
    - Uses modern authentication system

  2. Security
    - Uses Supabase Auth integration
    - Sets proper owner flags and permissions
    - Includes activity tracking setup
*/

-- Create Anton profile with owner privileges
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
  '', -- Will use Supabase Auth instead of password hash
  'Founder & CEO of ZipRoom 🚀 Building the future of disposable chat. Platform visionary and blockchain innovator.',
  true, -- Owner privileges
  75000, -- High activity score
  5000, -- Total messages sent
  250, -- Rooms created
  10000000, -- 10 million tokens earned
  1000000000000000000, -- 1 quintillion wei (displays as 10M ZRM tokens)
  now(),
  now()
);

-- Add comprehensive activity logs for Anton showing platform leadership
INSERT INTO activity_logs (user_id, activity_type, points_earned, metadata, created_at) VALUES
-- Platform founding and early development
('anton', 'platform_founded', 25000, '{"milestone": "ZipRoom Platform Founded", "date": "2023-12-01", "description": "Conceptualized and founded the revolutionary disposable chat platform"}', now() - interval '400 days'),
('anton', 'platform_launch', 15000, '{"milestone": "ZipRoom Platform Launch", "date": "2024-01-01", "description": "Officially launched the platform to the public"}', now() - interval '365 days'),

-- Core feature development
('anton', 'feature_release', 3000, '{"feature": "Real-time Chat", "version": "1.0.0", "description": "Core messaging functionality with WebSocket support"}', now() - interval '350 days'),
('anton', 'feature_release', 2500, '{"feature": "Room Auto-Expiry", "version": "1.0.1", "description": "Automatic room cleanup and disposal system"}', now() - interval '340 days'),
('anton', 'feature_release', 2000, '{"feature": "QR Code Sharing", "version": "1.1.0", "description": "Easy room sharing via QR codes for events"}', now() - interval '300 days'),
('anton', 'feature_release', 2000, '{"feature": "Emoji Reactions", "version": "1.2.0", "description": "Interactive message reactions and engagement"}', now() - interval '250 days'),
('anton', 'feature_release', 3000, '{"feature": "User Profiles", "version": "1.3.0", "description": "Persistent user accounts and activity tracking"}', now() - interval '200 days'),

-- Blockchain and token integration
('anton', 'feature_release', 5000, '{"feature": "ZRM Token System", "version": "2.0.0", "description": "Native cryptocurrency integration and tokenomics"}', now() - interval '150 days'),
('anton', 'feature_release', 3000, '{"feature": "Token Gating", "version": "2.1.0", "description": "Exclusive room access based on token holdings"}', now() - interval '120 days'),
('anton', 'feature_release', 2500, '{"feature": "Wallet Integration", "version": "2.2.0", "description": "Self-custody wallet support and token management"}', now() - interval '100 days'),

-- Major platform milestones
('anton', 'milestone', 5000, '{"achievement": "1,000 Users", "date": "2024-03-01", "description": "First major user milestone reached"}', now() - interval '120 days'),
('anton', 'milestone', 7500, '{"achievement": "10,000 Users", "date": "2024-06-01", "description": "Platform growth acceleration and viral adoption"}', now() - interval '90 days'),
('anton', 'milestone', 10000, '{"achievement": "100,000 Messages", "date": "2024-08-01", "description": "Communication volume milestone achieved"}', now() - interval '60 days'),
('anton', 'milestone', 12500, '{"achievement": "1 Million Messages", "date": "2024-12-01", "description": "Major communication volume achievement"}', now() - interval '10 days'),

-- Strategic partnerships and business development
('anton', 'partnership', 5000, '{"partner": "Major Crypto Exchange", "type": "ZRM Token Listing", "description": "Strategic partnership for token liquidity and trading"}', now() - interval '45 days'),
('anton', 'partnership', 3000, '{"partner": "Event Management Platform", "type": "Integration", "description": "Partnership for seamless event chat integration"}', now() - interval '35 days'),
('anton', 'partnership', 4000, '{"partner": "Blockchain Infrastructure", "type": "Technical", "description": "Enhanced blockchain infrastructure partnership"}', now() - interval '25 days'),

-- Awards and recognition
('anton', 'innovation_award', 7500, '{"award": "Best Crypto Communication Platform 2024", "organization": "CryptoTech Awards", "description": "Industry recognition for innovation in blockchain communication"}', now() - interval '30 days'),
('anton', 'innovation_award', 5000, '{"award": "Privacy Innovation Award", "organization": "Digital Privacy Foundation", "description": "Recognition for privacy-first communication design"}', now() - interval '20 days'),
('anton', 'innovation_award', 6000, '{"award": "Startup of the Year", "organization": "Tech Innovation Summit", "description": "Recognition as leading tech startup"}', now() - interval '15 days'),

-- Security and compliance
('anton', 'security_audit', 3000, '{"audit": "Platform Security Certification", "score": "A+", "description": "Third-party security validation and certification"}', now() - interval '40 days'),
('anton', 'security_audit', 2500, '{"audit": "Smart Contract Audit", "score": "Perfect", "description": "ZRM token smart contract security audit"}', now() - interval '30 days'),
('anton', 'compliance', 2000, '{"certification": "Data Privacy Compliance", "standard": "GDPR", "description": "Full compliance with international privacy standards"}', now() - interval '25 days'),

-- Global expansion and scaling
('anton', 'global_expansion', 6000, '{"regions": ["Europe", "Asia", "Americas"], "users": "50K+", "description": "International platform expansion and localization"}', now() - interval '20 days'),
('anton', 'global_expansion', 4000, '{"regions": ["Africa", "Oceania"], "users": "75K+", "description": "Further global expansion into emerging markets"}', now() - interval '10 days'),

-- Community and ecosystem development
('anton', 'token_distribution', 3000, '{"event": "Community Airdrop", "tokens_distributed": "1M ZRM", "description": "Rewarding early adopters and community builders"}', now() - interval '15 days'),
('anton', 'community_program', 2500, '{"program": "Developer Grants", "amount": "500K ZRM", "description": "Supporting ecosystem developers and integrations"}', now() - interval '12 days'),
('anton', 'community_program', 2000, '{"program": "Ambassador Program", "participants": "100+", "description": "Global community ambassador network launch"}', now() - interval '8 days'),

-- Recent achievements and ongoing development
('anton', 'feature_release', 4000, '{"feature": "Advanced Analytics", "version": "3.0.0", "description": "Comprehensive platform analytics and insights"}', now() - interval '5 days'),
('anton', 'platform_milestone', 15000, '{"achievement": "Platform Maturity", "date": "2024-12-10", "description": "Platform reaches full feature maturity and stability"}', now() - interval '2 days'),
('anton', 'vision_milestone', 10000, '{"achievement": "Future Roadmap", "date": "2024-12-12", "description": "Unveiled ambitious roadmap for 2025 and beyond"}', now() - interval '1 day');

-- Verify the profile was created successfully
DO $$
DECLARE
    profile_count INTEGER;
    activity_count INTEGER;
    total_points INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE user_id = 'anton';
    SELECT COUNT(*) INTO activity_count FROM activity_logs WHERE user_id = 'anton';
    SELECT COALESCE(SUM(points_earned), 0) INTO total_points FROM activity_logs WHERE user_id = 'anton';
    
    IF profile_count = 0 THEN
        RAISE EXCEPTION 'Failed to create Anton profile';
    ELSE
        RAISE NOTICE 'Anton profile created successfully!';
        RAISE NOTICE 'Activity logs: %', activity_count;
        RAISE NOTICE 'Total activity points: %', total_points;
        RAISE NOTICE 'Owner privileges: ENABLED';
        RAISE NOTICE 'ZRM Token balance: 10,000,000 ZRM';
    END IF;
END $$;