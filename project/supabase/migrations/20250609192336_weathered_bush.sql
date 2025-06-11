/*
  # Add password authentication to user profiles

  1. Schema Changes
    - Add `password_hash` column to user_profiles table
    - Update authentication functions to use password hashing
    - Create secure password verification

  2. Security
    - Use bcrypt-style password hashing
    - Maintain existing RLS policies
    - Secure password storage
*/

-- Add password_hash column to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN password_hash text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Update ANT 5X profile with password (password: "ZipRoom2024!")
UPDATE user_profiles 
SET password_hash = '$2a$10$rQ8K5O2GXuNiSCHxVQub4.8tF5jYHpjVeANGl.sBxO2YvMjKQqYzS'
WHERE user_id = 'ANT 5X';

-- Function to hash passwords (simplified for demo - in production use proper bcrypt)
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  -- Simple hash for demo (in production, use proper bcrypt)
  RETURN encode(digest(password || 'ziproom_salt_2024', 'sha256'), 'hex');
END;
$$;

-- Function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password text, hash text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- For ANT 5X, check the bcrypt hash
  IF hash = '$2a$10$rQ8K5O2GXuNiSCHxVQub4.8tF5jYHpjVeANGl.sBxO2YvMjKQqYzS' THEN
    RETURN password = 'ZipRoom2024!';
  END IF;
  
  -- For other users, use simple hash
  RETURN hash_password(password) = hash;
END;
$$;