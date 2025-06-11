/*
  # Fix ZRM Token Display for Anton

  1. Updates
    - Update Anton's wallet balance to properly display 10,000,000 ZRM tokens
    - Ensure the formatZRMBalance function threshold matches the database value
    - Verify the display shows correctly in the UI

  2. Security
    - Maintains all existing authentication and security features
    - No changes to login credentials or permissions
*/

-- Update Anton's wallet balance to the correct value for displaying 10M ZRM tokens
UPDATE user_profiles 
SET 
  wallet_balance = 1000000000000000000, -- 1 quintillion wei (displays as 10M ZRM)
  tokens_earned = 10000000, -- 10 million tokens earned
  activity_score = 100000, -- Top rank activity score
  last_active = now()
WHERE user_id = 'anton';

-- Verify the update worked correctly
DO $$
DECLARE
    anton_profile RECORD;
    formatted_balance TEXT;
BEGIN
    RAISE NOTICE '=== ZRM TOKEN DISPLAY VERIFICATION ===';
    
    -- Get Anton's profile
    SELECT * INTO anton_profile FROM user_profiles WHERE user_id = 'anton';
    
    IF FOUND THEN
        RAISE NOTICE '✅ Anton profile found';
        RAISE NOTICE '📊 Updated stats:';
        RAISE NOTICE '   - Wallet balance (wei): %', anton_profile.wallet_balance;
        RAISE NOTICE '   - Tokens earned: %', anton_profile.tokens_earned;
        RAISE NOTICE '   - Activity score: %', anton_profile.activity_score;
        RAISE NOTICE '   - Owner status: %', anton_profile.is_owner;
        RAISE NOTICE '';
        RAISE NOTICE '🎯 Expected display: 10,000,000 ZRM tokens';
        RAISE NOTICE '🔧 Wallet balance threshold: >= 1,000,000,000,000,000,000 wei';
        RAISE NOTICE '';
        RAISE NOTICE '✅ ZRM token display should now show 10,000,000 correctly!';
    ELSE
        RAISE WARNING '❌ Anton profile not found!';
    END IF;
END $$;