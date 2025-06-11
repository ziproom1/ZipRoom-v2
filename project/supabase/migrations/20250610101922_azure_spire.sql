/*
  # Fix Anton user password hash

  1. Updates
    - Update anton user password hash to use the correct format
    - Use the same hashing method as the verify_password function expects
    - Ensure the password "ZipRoom2024!" works with the authentication system

  2. Security
    - Uses the same hash_password function that's defined in the database
    - Maintains consistency with the authentication system
*/

-- Update anton user with correct password hash for "ZipRoom2024!"
UPDATE user_profiles 
SET password_hash = encode(digest('ZipRoom2024!' || 'ziproom_salt_2024', 'sha256'), 'hex')
WHERE user_id = 'anton';

-- Verify the update worked (fixed SQL)
DO $$
DECLARE
    user_count INTEGER;
    hash_value TEXT;
BEGIN
    SELECT COUNT(*) INTO user_count 
    FROM user_profiles 
    WHERE user_id = 'anton';
    
    IF user_count = 0 THEN
        RAISE EXCEPTION 'Anton user not found';
    ELSE
        SELECT password_hash INTO hash_value 
        FROM user_profiles 
        WHERE user_id = 'anton';
        
        RAISE NOTICE 'Anton user password updated successfully. Hash: %', substring(hash_value, 1, 20) || '...';
    END IF;
END $$;