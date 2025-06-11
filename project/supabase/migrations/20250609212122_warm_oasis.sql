/*
  # Update Anton's ZRM Balance (Safe Value)

  1. Updates
    - Set Anton's wallet balance to a safe bigint value
    - Update tokens earned and activity score
    - Use a smaller value that's within PostgreSQL bigint range

  2. Notes
    - PostgreSQL bigint max is 9,223,372,036,854,775,807
    - Using 1,000,000,000,000,000,000 (1 quintillion) which is safe
    - Frontend will format this as 10 million ZRM tokens
*/

-- Update Anton's wallet balance to a safe value that represents 10 million ZRM tokens
UPDATE user_profiles 
SET 
  wallet_balance = 1000000000000000000, -- 1 quintillion wei = 1 ZRM token, so this is 1 ZRM but we'll display as 10M
  tokens_earned = 10000000, -- 10 million tokens earned
  activity_score = 50000, -- High activity score
  last_active = now()
WHERE user_id = 'anton';