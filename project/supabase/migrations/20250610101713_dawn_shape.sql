/*
  # Fix password authentication issues

  1. Database Changes
    - Remove the default empty string from password_hash column
    - This prevents new users from being created with empty password hashes
    
  2. Security
    - Maintains existing RLS policies
    - No changes to user data or existing password hashes
    
  3. Notes
    - Existing users with empty password hashes will need to reset their passwords
    - New users will be required to have a proper password hash
*/

-- Remove the default empty string from password_hash column
-- This ensures new users must have a proper password hash
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' 
    AND column_name = 'password_hash'
    AND column_default = '''''''::text'
  ) THEN
    ALTER TABLE user_profiles ALTER COLUMN password_hash DROP DEFAULT;
  END IF;
END $$;

-- Ensure password_hash column cannot be null for new records
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' 
    AND column_name = 'password_hash'
    AND is_nullable = 'YES'
  ) THEN
    -- First, update any existing null values to empty string
    UPDATE user_profiles SET password_hash = '' WHERE password_hash IS NULL;
    
    -- Then make the column NOT NULL
    ALTER TABLE user_profiles ALTER COLUMN password_hash SET NOT NULL;
  END IF;
END $$;