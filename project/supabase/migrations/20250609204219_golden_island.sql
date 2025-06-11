/*
  # Update Anton's Profile with Top-Tier Stats

  1. Profile Updates
    - Set Anton as rank #1 with 50,000 activity score
    - Update message count, rooms created, and tokens earned
    - Set wallet balance to 1 million ZRM tokens (within bigint range)
    - Update bio to reflect platform leadership

  2. Activity Logs
    - Clear existing logs and add impressive achievement history
    - Include platform milestones, feature releases, and awards
    - Show comprehensive leadership activities over time
*/

-- Update Anton's profile with top-tier stats (using safe bigint value)
UPDATE user_profiles 
SET 
  activity_score = 50000,
  total_messages = 2500,
  rooms_created = 150,
  tokens_earned = 50000,
  wallet_balance = 1000000000000000000, -- 1 million ZRM tokens in wei (18 decimals) - safe bigint value
  bio = 'Founder & CEO of ZipRoom 🚀 Building the future of disposable chat. Platform visionary and top contributor.',
  last_active = now()
WHERE user_id = 'anton';

-- Clear existing activity logs for Anton and add impressive ones
DELETE FROM activity_logs WHERE user_id = 'anton';

-- Add impressive activity logs for Anton
INSERT INTO activity_logs (user_id, activity_type, points_earned, metadata, created_at) VALUES
('anton', 'platform_milestone', 10000, '{"achievement": "10,000 Users Milestone", "date": "2024-12-01"}', now() - interval '30 days'),
('anton', 'feature_release', 5000, '{"feature": "Advanced Analytics Dashboard", "version": "2.0.0"}', now() - interval '25 days'),
('anton', 'community_growth', 3000, '{"milestone": "100,000 Messages Sent", "date": "2024-11-15"}', now() - interval '20 days'),
('anton', 'partnership', 2000, '{"partner": "Major Crypto Exchange", "type": "Integration"}', now() - interval '15 days'),
('anton', 'innovation_award', 5000, '{"award": "Best Crypto Communication Platform 2024", "organization": "CryptoTech Awards"}', now() - interval '10 days'),
('anton', 'token_distribution', 1000, '{"event": "Community Airdrop", "tokens_distributed": "1M ZRM"}', now() - interval '7 days'),
('anton', 'security_audit', 2000, '{"audit": "Platform Security Certification", "score": "A+"}', now() - interval '5 days'),
('anton', 'global_expansion', 3000, '{"regions": ["Europe", "Asia", "Americas"], "users": "50K+"}', now() - interval '2 days'),
('anton', 'platform_launch', 5000, '{"milestone": "ZipRoom Platform Launch", "date": "2024-01-01"}', now() - interval '60 days'),
('anton', 'room_created', 10, '{"room_name": "Welcome Room", "description": "First room created"}', now() - interval '55 days'),
('anton', 'room_created', 10, '{"room_name": "Tech Talk", "description": "Developer discussions"}', now() - interval '50 days'),
('anton', 'room_created', 10, '{"room_name": "Community Hub", "description": "General community chat"}', now() - interval '45 days'),
('anton', 'feature_release', 1000, '{"feature": "QR Code Sharing", "version": "1.1.0"}', now() - interval '40 days'),
('anton', 'feature_release', 1000, '{"feature": "Emoji Reactions", "version": "1.2.0"}', now() - interval '35 days'),
('anton', 'milestone', 2000, '{"achievement": "1000 Users", "date": "2024-06-01"}', now() - interval '30 days');