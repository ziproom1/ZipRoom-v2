/*
  # Fix demo user password hash

  1. Updates
    - Update anton user password hash to use the correct format
    - Use the same hashing method as the verify_password function expects
    - Ensure the password "ZipRoom2024!" works with the authentication system

  2. Security
    - Uses the same hash_password function that's defined in the database
    - Maintains consistency with the authentication system
*/

-- Update anton user with correct password hash
UPDATE user_profiles 
SET password_hash = encode(digest('ZipRoom2024!' || 'ziproom_salt_2024', 'sha256'), 'hex')
WHERE user_id = 'anton';